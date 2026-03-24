import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { CustomerCard } from '@/components/ui/CustomerCard';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { qk } from '@/lib/query-keys';
import { fetchCustomers } from '@/services/customers.service';
import { createOrder } from '@/services/orders.service';
import { fetchServiceTypes } from '@/services/service-types.service';
import type { Customer, ServiceType } from '@/types/models';
import { ApiClientError } from '@/types/api';
import { theme, textVariants } from '@/theme';
import { formatCurrencyIdr } from '@/utils/currency';
import { createOrderSchema } from '@/validation/schemas';
import { z } from 'zod';

type FormValues = z.infer<typeof createOrderSchema>;

export default function CreateOrderScreen() {
  const router = useRouter();
  const [customerQ, setCustomerQ] = useState('');
  const debouncedCQ = useDebouncedValue(customerQ, 300);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: '',
      note: '',
      items: [
        { serviceTypeId: '', quantity: 1, unitPrice: 0, discount: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const customerId = watch('customerId');

  const customersQuery = useQuery({
    queryKey: qk.customers({ q: debouncedCQ, page: 1 }),
    queryFn: () => fetchCustomers(debouncedCQ || undefined, 1, 25),
    enabled: !customerId,
  });

  const serviceQuery = useQuery({
    queryKey: qk.serviceTypes,
    queryFn: () => fetchServiceTypes(true),
  });

  const selectedCustomerLabel = customersQuery.data?.items.find((c) => c.id === customerId)?.name;

  const openPicker = (index: number) => {
    setPickerIndex(index);
    setPickerOpen(true);
  };

  const onPickService = (st: ServiceType) => {
    if (pickerIndex == null) return;
    setValue(`items.${pickerIndex}.serviceTypeId`, st.id);
    const price = Number(st.defaultPrice);
    if (Number.isFinite(price)) {
      setValue(`items.${pickerIndex}.unitPrice`, price);
    }
    setPickerOpen(false);
    setPickerIndex(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const created = await createOrder({
        customerId: values.customerId,
        note: values.note || undefined,
        items: values.items.map((line) => ({
          serviceTypeId: line.serviceTypeId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discount: line.discount,
        })),
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

  return (
    <View style={styles.flex}>
      <AppHeader title="Nota baru" onBack={() => router.back()} />

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
            <SearchInput
              value={customerQ}
              onChangeText={setCustomerQ}
              placeholder="Ketik nama / telepon"
            />
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

        <Text style={styles.section}>Item layanan</Text>
        {errors.items?.message ? (
          <Text style={styles.fieldErr}>{String(errors.items.message)}</Text>
        ) : null}

        {fields.map((field, index) => (
          <View key={field.id} style={styles.itemBlock}>
            <View style={styles.itemHead}>
              <Text style={textVariants.label}>Baris {index + 1}</Text>
              {fields.length > 1 ? (
                <Pressable onPress={() => remove(index)}>
                  <Text style={styles.remove}>Hapus</Text>
                </Pressable>
              ) : null}
            </View>

            <FormField
              label="Layanan"
              error={errors.items?.[index]?.serviceTypeId?.message}>
              <Controller
                control={control}
                name={`items.${index}.serviceTypeId`}
                render={({ field: { value } }) => {
                  const st = serviceQuery.data?.find((s) => s.id === value);
                  return (
                    <Pressable style={styles.selectBtn} onPress={() => openPicker(index)}>
                      <Text style={value ? styles.selectText : styles.selectPlaceholder}>
                        {st ? `${st.name} (${st.unit})` : 'Pilih layanan'}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </FormField>

            <View style={styles.row2}>
              <FormField
                label="Qty"
                style={{ flex: 1, marginRight: theme.space.sm }}
                error={errors.items?.[index]?.quantity?.message}>
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
              <FormField label="Harga" style={{ flex: 1 }} error={errors.items?.[index]?.unitPrice?.message}>
                <Controller
                  control={control}
                  name={`items.${index}.unitPrice`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      value={String(value)}
                      onChangeText={(t) => onChange(Number(t.replace(/\./g, '').replace(',', '.')) || 0)}
                    />
                  )}
                />
              </FormField>
            </View>

            <FormField label="Diskon" error={errors.items?.[index]?.discount?.message}>
              <Controller
                control={control}
                name={`items.${index}.discount`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={String(value ?? 0)}
                    onChangeText={(t) => onChange(Number(t.replace(/\./g, '').replace(',', '.')) || 0)}
                  />
                )}
              />
            </FormField>
          </View>
        ))}

        <Pressable
          style={styles.addRow}
          onPress={() =>
            append({ serviceTypeId: '', quantity: 1, unitPrice: 0, discount: 0 })
          }>
          <Text style={styles.addRowText}>+ Tambah baris</Text>
        </Pressable>

        <FormField label="Catatan (opsional)" error={errors.note?.message}>
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

        <PrimaryButton
          title="Simpan nota"
          onPress={() => void onSubmit()}
          loading={isSubmitting}
        />
      </ScrollView>

      <Modal visible={pickerOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[textVariants.title, { marginBottom: theme.space.md }]}>
              Pilih layanan
            </Text>
            <FlatList
              data={serviceQuery.data ?? []}
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
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { padding: theme.space.md, paddingBottom: theme.space.xxxl },
  apiErr: { color: theme.color.error, marginBottom: theme.space.md },
  section: {
    ...textVariants.label,
    marginTop: theme.space.md,
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
    marginBottom: theme.space.sm,
  },
  remove: { color: theme.color.error, fontWeight: theme.fontWeight.medium },
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  addRow: {
    padding: theme.space.md,
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.color.primary,
    marginBottom: theme.space.md,
  },
  addRowText: { color: theme.color.primary, fontWeight: theme.fontWeight.semibold },
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
    maxHeight: '70%',
  },
  modalRow: {
    paddingVertical: theme.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border,
  },
});
