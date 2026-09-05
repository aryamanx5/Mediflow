import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldRow, SelectField, TextField } from "../ui/Field";
import { ApiError } from "../../services/client";
import type { CustomerInput } from "../../services/api";
import type { Customer } from "../../services/types";

/**
 * Covers every field on the Customer schema, including the optional ones the
 * old form dropped: GST number, address type, address line 2, landmark and
 * country. They were being silently defaulted despite the backend accepting
 * them.
 */
const BLANK = {
  customerId: "",
  customerName: "",
  age: "",
  gender: "Male",
  phone: "",
  email: "",
  gstNumber: "",
  addressType: "Home",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
  country: "India",
};

type Values = typeof BLANK;

export function CustomerForm({
  open,
  customer,
  onClose,
  onSubmit,
}: {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (input: CustomerInput) => Promise<void>;
}) {
  const [values, setValues] = useState<Values>(BLANK);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setValues(
      customer
        ? {
            customerId: customer.customerId,
            customerName: customer.customerName,
            age: String(customer.age),
            gender: customer.gender,
            phone: customer.phone,
            email: customer.email,
            gstNumber: customer.gstNumber ?? "",
            addressType: customer.addressType ?? "Home",
            addressLine1: customer.addressLine1,
            addressLine2: customer.addressLine2 ?? "",
            landmark: customer.landmark ?? "",
            city: customer.city,
            state: customer.state,
            pinCode: customer.pinCode,
            country: customer.country ?? "India",
          }
        : BLANK,
    );
  }, [open, customer]);

  const set =
    (key: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit({
        customerId: values.customerId.trim(),
        customerName: values.customerName.trim(),
        age: Number(values.age),
        gender: values.gender as CustomerInput["gender"],
        phone: values.phone.trim(),
        email: values.email.trim(),
        gstNumber: values.gstNumber.trim(),
        addressType: values.addressType as CustomerInput["addressType"],
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2.trim(),
        landmark: values.landmark.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        pinCode: values.pinCode.trim(),
        country: values.country.trim() || "India",
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the customer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={customer ? "Edit customer" : "Add customer"}
      description={customer ? customer.customerId : "Contact details and where orders are delivered."}
    >
      <form onSubmit={submit} className="space-y-7" noValidate>
        <section className="space-y-6">
          <p className="u-label border-b border-line-soft pb-2">Identity</p>
          <FieldRow>
            <TextField
              label="Customer ID"
              required
              value={values.customerId}
              onChange={set("customerId")}
              hint="Must be unique."
            />
            <TextField
              label="Full name"
              required
              value={values.customerName}
              onChange={set("customerName")}
            />
          </FieldRow>
          <FieldRow cols={3}>
            <TextField
              label="Age"
              type="number"
              min={0}
              required
              value={values.age}
              onChange={set("age")}
            />
            <SelectField
              label="Gender"
              required
              value={values.gender}
              onChange={set("gender")}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
            <TextField
              label="GST number"
              value={values.gstNumber}
              onChange={set("gstNumber")}
              hint="Optional."
            />
          </FieldRow>
          <FieldRow>
            <TextField
              label="Phone"
              type="tel"
              required
              value={values.phone}
              onChange={set("phone")}
            />
            <TextField
              label="Email"
              type="email"
              required
              value={values.email}
              onChange={set("email")}
            />
          </FieldRow>
        </section>

        <section className="space-y-6">
          <p className="u-label border-b border-line-soft pb-2">Address</p>
          <SelectField
            label="Address type"
            value={values.addressType}
            onChange={set("addressType")}
            options={[
              { value: "Home", label: "Home" },
              { value: "Work", label: "Work" },
              { value: "Other", label: "Other" },
            ]}
          />
          <TextField
            label="Address line 1"
            required
            value={values.addressLine1}
            onChange={set("addressLine1")}
          />
          <FieldRow>
            <TextField
              label="Address line 2"
              value={values.addressLine2}
              onChange={set("addressLine2")}
            />
            <TextField label="Landmark" value={values.landmark} onChange={set("landmark")} />
          </FieldRow>
          <FieldRow cols={3}>
            <TextField label="City" required value={values.city} onChange={set("city")} />
            <TextField label="State" required value={values.state} onChange={set("state")} />
            <TextField
              label="Pin code"
              required
              inputMode="numeric"
              value={values.pinCode}
              onChange={set("pinCode")}
            />
          </FieldRow>
          <TextField label="Country" value={values.country} onChange={set("country")} />
        </section>

        {error && (
          <p role="alert" className="text-[0.85rem] text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {customer ? "Save changes" : "Add customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
