// src/pages/Users/UserFormModal.tsx

import React, { useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import type { UserFormValues, UserRole, ValidationErrors } from "./types";

type Mode = "create" | "edit";

type UserFormModalProps = {
  open: boolean;
  mode: Mode;
  initialValues: UserFormValues;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  submitting: boolean;
  errors: ValidationErrors;
  canEditRole: boolean;
  isEditingSuperAdmin: boolean;
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting,
  errors,
  canEditRole,
  isEditingSuperAdmin,
}) => {
  const [values, setValues] = useState<UserFormValues>(initialValues);
 
  const handleChange =
    (field: keyof UserFormValues) =>
    (value: string) => {
      setValues((prev) => ({
        ...prev,
        [field]: field === "role" ? (value as UserRole) : value,
      }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const title = mode === "create" ? "New User" : "Edit User";

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {errors._general && (
        <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-smtext-red-700">
          {errors._general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-smfont-semibold uppercase tracking-wide text-gray-500">
            Account Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              value={values.name}
              onChange={handleChange("name")}
              placeholder="e.g. Anna Dela Cruz"
              required
              helperText={errors.name}
            />
            <Input
              label="Username"
              value={values.username}
              onChange={handleChange("username")}
              placeholder="e.g. annadcruz"
              required
              helperText={errors.username}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-smfont-semibold uppercase tracking-wide text-gray-500">
            Security
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={
                mode === "create"
                  ? "Password"
                  : "Password (leave blank to keep current)"
              }
              type="password"
              value={values.password}
              onChange={handleChange("password")}
              placeholder={mode === "create" ? "Enter password" : "Leave blank"}
              required={mode === "create"}
              helperText={errors.password}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-smfont-semibold uppercase tracking-wide text-gray-500">
            Role
          </h3>

          <Select
            label="Role"
            value={values.role}
            onChange={handleChange("role")}
            options={[ 
              { value: "admin", label: "Admin" },
              { value: "staff", label: "Staff" },
              { value: "warehouse_manager", label: "Warehouse Manager"},
              { value: "warehouse_staff", label: "Warehouse Staff"},
              { value: "cashier", label: "Cashier"},
            ]}
            disabled={!canEditRole || isEditingSuperAdmin}
            error={
                isEditingSuperAdmin
                ? "Super admin role cannot be changed."
                : errors.role
            }

          />
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {mode === "create" ? "Create User" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
