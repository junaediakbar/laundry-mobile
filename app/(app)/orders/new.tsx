import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  IconCalendar,
  IconCamera,
  IconPhoto,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { CustomerCard } from '@/components/ui/CustomerCard';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { qk } from '@/lib/query-keys';
import { fetchCustomers } from '@/services/customers.service';
import { createOrderWithOptionalImage } from '@/services/orders.service';
import { fetchServiceTypes } from '@/services/service-types.service';
import type { Customer, ServiceType } from '@/types/models';
import { ApiClientError } from '@/types/api';
import { theme, textVariants } from '@/theme';
import { formatDateId, formatYmd } from '@/utils/date';
import { formatCurrencyIdr } from '@/utils/currency';
import {
  applyLengthM1,
  applyLengthWidthM2,
  getServiceForLine,
  isM1Unit,
  isM2Unit,
  lineSubtotal,
  type OrderLineDraft,
} from '@/utils/order-lines';
import { createOrderSchema } from '@/validation/schemas';
import { z } from 'zod';

type FormValues = z.infer<typeof createOrderSchema>;

function validateLines(items: FormValues['items'], services: ServiceType[]): string | null {
  for (let i = 0; i < items.length; i++) {
    const line = items[i];
    const st = services.find((s) => s.id === line.serviceTypeId);
    if (!st) return `Baris ${i + 1}: pilih layanan`;
    const u = st.unit;
    if (isM2Unit(u)) {
      if (line.quantity <= 0) return `Baris ${i + 1}: isi panjang & lebar (m²)`;
    } else if (isM1Unit(u)) {
      if (line.quantity <= 0) return `Baris ${i + 1}: isi panjang (m)`;
    } else if (line.quantity <= 0) {
      return `Baris ${i + 1}: qty harus lebih dari 0`;
    }
  }
  return null;
}

export default function CreateOrderScreen() {
  const router = useRouter();
  const [customerQ, setCustomerQ] = useState('');
  const debouncedCQ = useDebouncedValue(customerQ, 300);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [recvDate, setRecvDate] = useState(() => new Date());
  const [compDate, setCompDate] = useState<Date | null>(null);
  const [dateTarget, setDateTarget] = useState<null | 'received' | 'completed'>(null);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);

  const defaultCustomerApplied = useRef(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: '',
      note: '',
      items: [
        { serviceTypeId: '', quantity: 1, unitPrice: 0, discount: 0, length: 0, width: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const customerId = watch('customerId');
  const itemsWatch = watch('items');

  const customersQuery = useQuery({
    queryKey: qk.customers({ q: debouncedCQ, page: 1 }),
    queryFn: () => fetchCustomers(debouncedCQ || undefined, 1, 200),
    enabled: !customerId,
  });

  const serviceQuery = useQuery({
    queryKey: qk.serviceTypes,
    queryFn: () => fetchServiceTypes(true),
  });

  const services = serviceQuery.data ?? [];

  useEffect(() => {
    if (defaultCustomerApplied.current) return;
    const first = customersQuery.data?.items?.[0]?.id;
    if (!first) return;
    setValue('customerId', first);
    defaultCustomerApplied.current = true;
  }, [customersQuery.data, setValue]);

  const selectedCustomerLabel = customersQuery.data?.items.find((c) => c.id === customerId)?.name;

  const grandTotal = useMemo(() => {
    return (itemsWatch as OrderLineDraft[]).reduce(
      (sum, line) => sum + lineSubtotal(line),
      0,
    );
  }, [itemsWatch]);

  const openPicker = (index: number) => {
    setPickerIndex(index);
    setPickerOpen(true);
  };

  const onPickService = (st: ServiceType) => {
    if (pickerIndex == null) return;
    const idx = pickerIndex;
    setValue(`items.${idx}.serviceTypeId`, st.id);
    const price = Number(st.defaultPrice);
    if (Number.isFinite(price)) setValue(`items.${idx}.unitPrice`, price);
    setValue(`items.${idx}.length`, 0);
    setValue(`items.${idx}.width`, 0);
    if (isM2Unit(st.unit)) {
      setValue(`items.${idx}.quantity`, 0);
    } else if (isM1Unit(st.unit)) {
      setValue(`items.${idx}.quantity`, 0);
    } else {
      setValue(`items.${idx}.quantity`, 1);
    }
    setPickerOpen(false);
    setPickerIndex(null);
  };

  const applyPickedAsset = (a: ImagePicker.ImagePickerAsset) => {
    setImageUri(a.uri);
    setImageMime(a.mimeType ?? 'image/jpeg');
  };

  const pickImageFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk melampirkan foto nota.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (res.canceled || !res.assets[0]) return;
    applyPickedAsset(res.assets[0]);
  };

  const pickImageFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin diperlukan', 'Izinkan akses kamera untuk memotret foto nota.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (res.canceled || !res.assets[0]) return;
    applyPickedAsset(res.assets[0]);
  };

  const onSubmit = handleSubmit(async (values) => {
    const err = validateLines(values.items, services);
    if (err) {
      setApiError(err);
      return;
    }
    setApiError(null);
    try {
      const created = await createOrderWithOptionalImage({
        customerId: values.customerId,
        receivedDate: formatYmd(recvDate),
        completedDate: compDate ? formatYmd(compDate) : null,
        note: values.note || null,
        items: values.items.map((line) => ({
          serviceTypeId: line.serviceTypeId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discount: line.discount,
        })),
        imageUri: imageUri ?? undefined,
        mimeType: imageMime ?? undefined,
        imageName: 'nota.jpg',
      });
      router.replace(`/(app)/orders/${created.id}`);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Gagal membuat nota';
      setApiError(msg);
    }
  });

  const onDateChange = (event: { type?: string }, selected?: Date) => {
    if (Platform.OS === 'android') {
      setDateTarget(null);
      if (event.type === 'dismissed') return;
    }
    if (!selected) return;
    if (dateTarget === 'received') setRecvDate(selected);
    if (dateTarget === 'completed') setCompDate(selected);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}>
      <View style={styles.flex}>
        <AppHeader title="Tambah nota" subtitle="Satu nota, beberapa item — seperti di web" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {apiError ? <Text style={styles.apiErr}>{apiError}</Text> : null}

          <Text style={styles.section}>Pelanggan</Text>
          {customerId ? (
            <View style={styles.selectedCustomer}>
              <Text style={[textVariants.body, { fontWeight: '600' }]}>
                {selectedCustomerLabel ?? 'Terpilih'}
              </Text>
              <Pressable onPress={() => setValue('customerId', '')}>
                <Text style={styles.changeLink}>Ganti</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <SearchInput value={customerQ} onChangeText={setCustomerQ} placeholder="Cari nama / telepon" />
              {errors.customerId ? (
                <Text style={styles.fieldErr}>{errors.customerId.message}</Text>
              ) : null}
              <View style={{ marginTop: theme.space.sm }}>
                {(customersQuery.data?.items ?? []).map((item: Customer) => (
                  <CustomerCard
                    key={item.id}
                    customer={item}
                    onPress={() => {
                      setValue('customerId', item.id);
                      setCustomerQ('');
                    }}
                  />
                ))}
              </View>
            </>
          )}

          <Text style={styles.section}>Tanggal</Text>
          <View style={styles.dateRow}>
            <Pressable style={styles.dateBtn} onPress={() => setDateTarget('received')}>
              <IconCalendar size={18} color={theme.color.primary} strokeWidth={1.75} />
              <View>
                <Text style={styles.dateLabel}>Tanggal masuk</Text>
                <Text style={styles.dateVal}>{formatDateId(recvDate)}</Text>
              </View>
            </Pressable>
            <Pressable style={styles.dateBtn} onPress={() => setDateTarget('completed')}>
              <IconCalendar size={18} color={theme.color.secondary} strokeWidth={1.75} />
              <View style={{ flex: 1 }}>
                <Text style={styles.dateLabel}>Tanggal selesai (opsional)</Text>
                <Text style={styles.dateVal}>
                  {compDate ? formatDateId(compDate) : '—'}
                </Text>
              </View>
              {compDate ? (
                <Pressable onPress={() => setCompDate(null)} hitSlop={8}>
                  <Text style={styles.clearSmall}>Hapus</Text>
                </Pressable>
              ) : null}
            </Pressable>
          </View>

          {dateTarget && Platform.OS === 'android' ? (
            <DateTimePicker
              value={dateTarget === 'received' ? recvDate : compDate ?? new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          ) : null}

          {dateTarget && Platform.OS === 'ios' ? (
            <Modal
              transparent
              animationType="slide"
              visible={!!dateTarget}
              onRequestClose={() => setDateTarget(null)}>
              <View style={styles.iosDateWrap}>
                <Pressable style={styles.modalBg} onPress={() => setDateTarget(null)} />
                <View style={styles.modalSheet}>
                  <DateTimePicker
                    value={dateTarget === 'received' ? recvDate : compDate ?? new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(_, d) => {
                      if (d) {
                        if (dateTarget === 'received') setRecvDate(d);
                        if (dateTarget === 'completed') setCompDate(d);
                      }
                    }}
                  />
                  <PrimaryButton title="Selesai" onPress={() => setDateTarget(null)} />
                </View>
              </View>
            </Modal>
          ) : null}

          <Text style={styles.section}>Item pesanan</Text>
          {errors.items?.message ? (
            <Text style={styles.fieldErr}>{String(errors.items.message)}</Text>
          ) : null}

          {fields.map((field, index) => {
            const line = ((itemsWatch as OrderLineDraft[])?.[index] ??
              getValues(`items.${index}`)) as OrderLineDraft;
            const st = getServiceForLine(itemsWatch as OrderLineDraft[], index, services);
            const m2 = st ? isM2Unit(st.unit) : false;
            const m1 = st ? isM1Unit(st.unit) : false;
            const sub = lineSubtotal(line);

            return (
              <View key={field.id} style={styles.itemBlock}>
                <View style={styles.itemHead}>
                  <Text style={textVariants.label}>Baris {index + 1}</Text>
                  {fields.length > 1 ? (
                    <Pressable onPress={() => remove(index)} hitSlop={8}>
                      <IconTrash size={22} color={theme.color.error} strokeWidth={1.75} />
                    </Pressable>
                  ) : null}
                </View>

                <FormField label="Layanan" error={errors.items?.[index]?.serviceTypeId?.message}>
                  <Controller
                    control={control}
                    name={`items.${index}.serviceTypeId`}
                    render={({ field: { value } }) => {
                      const sel = services.find((s) => s.id === value);
                      return (
                        <Pressable style={styles.selectBtn} onPress={() => openPicker(index)}>
                          <Text style={value ? styles.selectText : styles.selectPlaceholder}>
                            {sel ? `${sel.name} (${sel.unit})` : 'Pilih layanan'}
                          </Text>
                        </Pressable>
                      );
                    }}
                  />
                </FormField>

                {m2 ? (
                  <View style={styles.row2}>
                    <FormField label="Panjang (m)" style={{ flex: 1, marginRight: theme.space.sm }}>
                      <Controller
                        control={control}
                        name={`items.${index}.length`}
                        render={({ field: { value, onChange } }) => (
                          <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            value={String(value ?? 0)}
                            onChangeText={(t) => {
                              const L = Number(t.replace(',', '.')) || 0;
                              const W = Number(getValues(`items.${index}.width`) || 0);
                              const next = applyLengthWidthM2(
                                { ...line, length: L, width: W },
                                L,
                                W,
                              );
                              setValue(`items.${index}.length`, L);
                              setValue(`items.${index}.width`, W);
                              setValue(`items.${index}.quantity`, next.quantity);
                            }}
                          />
                        )}
                      />
                    </FormField>
                    <FormField label="Lebar (m)" style={{ flex: 1 }}>
                      <Controller
                        control={control}
                        name={`items.${index}.width`}
                        render={({ field: { value, onChange } }) => (
                          <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            value={String(value ?? 0)}
                            onChangeText={(t) => {
                              const W = Number(t.replace(',', '.')) || 0;
                              const L = Number(getValues(`items.${index}.length`) || 0);
                              const next = applyLengthWidthM2(
                                { ...line, length: L, width: W },
                                L,
                                W,
                              );
                              setValue(`items.${index}.width`, W);
                              setValue(`items.${index}.length`, L);
                              setValue(`items.${index}.quantity`, next.quantity);
                            }}
                          />
                        )}
                      />
                    </FormField>
                  </View>
                ) : null}
                {m2 ? (
                  <Text style={styles.hintDim}>Qty dihitung otomatis (m²)</Text>
                ) : null}

                {m1 ? (
                  <>
                    <FormField label="Panjang (m)">
                      <Controller
                        control={control}
                        name={`items.${index}.length`}
                        render={() => (
                          <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            value={String(line.length ?? 0)}
                            onChangeText={(t) => {
                              const L = Number(t.replace(',', '.')) || 0;
                              const next = applyLengthM1(line, L);
                              setValue(`items.${index}.length`, L);
                              setValue(`items.${index}.quantity`, next.quantity);
                            }}
                          />
                        )}
                      />
                    </FormField>
                    <Text style={styles.hintDim}>Qty mengikuti panjang (m1)</Text>
                    <FormField label="Qty">
                      <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        editable={false}
                        value={String(line.quantity)}
                      />
                    </FormField>
                  </>
                ) : null}

                {!m2 && !m1 ? (
                  <FormField label="Qty" error={errors.items?.[index]?.quantity?.message}>
                    <Controller
                      control={control}
                      name={`items.${index}.quantity`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          keyboardType="decimal-pad"
                          value={String(value)}
                          onChangeText={(t) => onChange(Number(t.replace(',', '.')) || 0)}
                        />
                      )}
                    />
                  </FormField>
                ) : null}
                {st && !m2 && !m1 ? (
                  <Text style={styles.hintDim}>Unit: {st.unit}</Text>
                ) : null}

                <View style={styles.row2}>
                  <FormField label="Harga" style={{ flex: 1, marginRight: theme.space.sm }}>
                    <Controller
                      control={control}
                      name={`items.${index}.unitPrice`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          keyboardType="decimal-pad"
                          value={String(value)}
                          onChangeText={(t) =>
                            onChange(Number(t.replace(/\./g, '').replace(',', '.')) || 0)
                          }
                        />
                      )}
                    />
                  </FormField>
                  <FormField label="Diskon" style={{ flex: 1 }}>
                    <Controller
                      control={control}
                      name={`items.${index}.discount`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          keyboardType="decimal-pad"
                          value={String(value ?? 0)}
                          onChangeText={(t) =>
                            onChange(Number(t.replace(/\./g, '').replace(',', '.')) || 0)
                          }
                        />
                      )}
                    />
                  </FormField>
                </View>

                <View style={styles.subRow}>
                  <Text style={textVariants.caption}>Subtotal baris</Text>
                  <Text style={styles.subVal}>{formatCurrencyIdr(String(sub))}</Text>
                </View>
              </View>
            );
          })}

          <Pressable style={styles.addRow} onPress={() => append({
            serviceTypeId: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            length: 0,
            width: 0,
          })}>
            <IconPlus size={20} color={theme.color.primary} strokeWidth={2} />
            <Text style={styles.addRowText}>Tambah baris</Text>
          </Pressable>

          <View style={styles.totalBar}>
            <Text style={textVariants.title}>Total nota</Text>
            <Text style={styles.totalVal}>{formatCurrencyIdr(String(grandTotal))}</Text>
          </View>

          <Text style={styles.section}>Gambar nota (opsional)</Text>
          <Text style={[textVariants.caption, styles.imageHint]}>
            Ambil foto dengan kamera atau pilih dari galeri.
          </Text>
          <View style={styles.imageRow}>
            <Pressable
              style={styles.imageBtnHalf}
              onPress={pickImageFromCamera}
              accessibilityRole="button"
              accessibilityLabel="Buka kamera">
              <IconCamera size={22} color={theme.color.primary} strokeWidth={1.75} />
              <Text style={styles.imageBtnText} numberOfLines={2}>
                {imageUri ? 'Foto ulang' : 'Kamera'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.imageBtnHalf}
              onPress={pickImageFromLibrary}
              accessibilityRole="button"
              accessibilityLabel="Pilih dari galeri">
              <IconPhoto size={22} color={theme.color.primary} strokeWidth={1.75} />
              <Text style={styles.imageBtnText} numberOfLines={2}>
                {imageUri ? 'Ganti dari galeri' : 'Galeri'}
              </Text>
            </Pressable>
          </View>
          {imageUri ? (
            <Pressable onPress={() => { setImageUri(null); setImageMime(null); }}>
              <Text style={styles.clearImg}>Hapus gambar</Text>
            </Pressable>
          ) : null}

          <FormField label="Catatan" error={errors.note?.message}>
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder="Contoh: noda di kerah"
                  placeholderTextColor={theme.color.textMuted}
                  value={value ?? ''}
                  onChangeText={onChange}
                />
              )}
            />
          </FormField>

          <View style={styles.actions}>
            <PrimaryButton
              title="Simpan"
              loading={isSubmitting}
              onPress={() => void onSubmit()}
            />
            <PrimaryButton title="Batal" variant="secondary" onPress={() => router.back()} />
          </View>
        </ScrollView>

        <Modal visible={pickerOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={[textVariants.title, { marginBottom: theme.space.md }]}>Pilih layanan</Text>
              <FlatList
                style={{ maxHeight: 360 }}
                data={services}
                keyExtractor={(s) => s.id}
                renderItem={({ item }) => (
                  <Pressable style={styles.modalRow} onPress={() => onPickService(item)}>
                    <Text style={textVariants.body}>{item.name}</Text>
                    <Text style={[textVariants.caption, { color: theme.color.textSecondary }]}>
                      {formatCurrencyIdr(item.defaultPrice)} / {item.unit}
                    </Text>
                  </Pressable>
                )}
              />
              <PrimaryButton title="Tutup" variant="secondary" onPress={() => setPickerOpen(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  apiErr: { color: theme.color.error, marginBottom: theme.space.md },
  section: {
    ...textVariants.label,
    marginTop: theme.space.lg,
    marginBottom: theme.space.sm,
  },
  selectedCustomer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  changeLink: { color: theme.color.primary, fontWeight: theme.fontWeight.semibold },
  fieldErr: { color: theme.color.error, fontSize: theme.font.sm, marginTop: 4 },
  dateRow: { gap: theme.space.sm },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  dateLabel: { fontSize: theme.font.xs, color: theme.color.textMuted },
  dateVal: { fontSize: theme.font.md, fontWeight: theme.fontWeight.semibold, color: theme.color.text },
  clearSmall: { fontSize: theme.font.sm, color: theme.color.error },
  iosDateWrap: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.4)' },
  modalSheet: {
    backgroundColor: theme.color.surface,
    padding: theme.space.md,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  itemBlock: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  itemHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.space.sm,
  },
  selectBtn: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    backgroundColor: theme.color.bg,
  },
  selectText: { fontSize: theme.font.md, color: theme.color.text },
  selectPlaceholder: { fontSize: theme.font.md, color: theme.color.textMuted },
  row2: { flexDirection: 'row' },
  input: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    fontSize: theme.font.md,
    color: theme.color.text,
    backgroundColor: theme.color.bg,
  },
  inputDisabled: { opacity: 0.7, backgroundColor: theme.color.secondaryMuted },
  hintDim: { fontSize: theme.font.xs, color: theme.color.textMuted, marginBottom: theme.space.sm },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.space.sm,
    paddingTop: theme.space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.color.border,
  },
  subVal: { fontWeight: theme.fontWeight.semibold, color: theme.color.primaryDark },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.xs,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.color.primary,
    marginBottom: theme.space.md,
  },
  addRowText: { color: theme.color.primary, fontWeight: theme.fontWeight.semibold },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.space.md,
    backgroundColor: theme.color.primaryMuted,
    borderRadius: theme.radius.md,
    marginBottom: theme.space.md,
  },
  totalVal: { fontSize: theme.font.xl, fontWeight: theme.fontWeight.bold, color: theme.color.primaryDark },
  imageHint: { marginBottom: theme.space.sm, marginTop: -4 },
  imageRow: {
    flexDirection: 'row',
    gap: theme.space.sm,
  },
  imageBtnHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.sm,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    minHeight: 52,
  },
  imageBtnText: {
    flexShrink: 1,
    fontSize: theme.font.sm,
    color: theme.color.primary,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  clearImg: { marginTop: theme.space.xs, color: theme.color.error, fontSize: theme.font.sm },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  actions: { gap: theme.space.sm, marginTop: theme.space.md, marginBottom: theme.space.xl },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.space.lg,
    maxHeight: '72%',
  },
  modalRow: {
    paddingVertical: theme.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border,
  },
});
