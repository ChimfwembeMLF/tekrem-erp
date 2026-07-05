import React from 'react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

export interface SavedAddress {
  id: number;
  label: string;
  recipient_name: string;
  phone?: string | null;
  address_line: string;
  is_default: boolean;
}

interface CheckoutFields {
  name: string;
  email: string;
  phone: string;
  shipping_address: string;
}

interface Props {
  savedAddresses: SavedAddress[];
  selectedAddressId: number | null;
  onSelectAddress: (id: number | null) => void;
  form: CheckoutFields;
  onFormChange: (form: CheckoutFields) => void;
  saveAddress: boolean;
  onSaveAddressChange: (value: boolean) => void;
  addressLabel: string;
  onAddressLabelChange: (value: string) => void;
  showSaveOption?: boolean;
  idPrefix?: string;
}

export default function ShopSavedAddressFields({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  form,
  onFormChange,
  saveAddress,
  onSaveAddressChange,
  addressLabel,
  onAddressLabelChange,
  showSaveOption = true,
  idPrefix = 'shop',
}: Props) {
  const applySavedAddress = (id: string) => {
    if (id === 'new') {
      onSelectAddress(null);
      return;
    }

    const address = savedAddresses.find((item) => item.id === Number(id));
    if (!address) return;

    onSelectAddress(address.id);
    onFormChange({
      ...form,
      name: address.recipient_name,
      phone: address.phone ?? '',
      shipping_address: address.address_line,
    });
  };

  return (
    <div className="space-y-4">
      {savedAddresses.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-saved-address`}>Saved address</Label>
          <Select
            value={selectedAddressId ? String(selectedAddressId) : 'new'}
            onValueChange={applySavedAddress}
          >
            <SelectTrigger id={`${idPrefix}-saved-address`}>
              <SelectValue placeholder="Choose a saved address" />
            </SelectTrigger>
            <SelectContent>
              {savedAddresses.map((address) => (
                <SelectItem key={address.id} value={String(address.id)}>
                  {address.label} — {address.address_line.slice(0, 48)}
                  {address.address_line.length > 48 ? '…' : ''}
                </SelectItem>
              ))}
              <SelectItem value="new">Enter a new address</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Full name *</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => onFormChange({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>Email *</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={form.email}
          onChange={(e) => onFormChange({ ...form, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-phone`}>Phone</Label>
        <Input
          id={`${idPrefix}-phone`}
          value={form.phone}
          onChange={(e) => onFormChange({ ...form, phone: e.target.value })}
          placeholder="+260..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-address`}>Shipping address *</Label>
        <Textarea
          id={`${idPrefix}-address`}
          rows={4}
          value={form.shipping_address}
          onChange={(e) => onFormChange({ ...form, shipping_address: e.target.value })}
          placeholder="Street, area, city, province"
          required
        />
      </div>

      {showSaveOption && savedAddresses.length >= 0 && (
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${idPrefix}-save-address`}
              checked={saveAddress}
              onCheckedChange={(checked) => onSaveAddressChange(checked === true)}
            />
            <Label htmlFor={`${idPrefix}-save-address`} className="font-normal">
              Save this address for next time
            </Label>
          </div>
          {saveAddress && (
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-address-label`}>Address label</Label>
              <Input
                id={`${idPrefix}-address-label`}
                value={addressLabel}
                onChange={(e) => onAddressLabelChange(e.target.value)}
                placeholder="Home, Office, etc."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
