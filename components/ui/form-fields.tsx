"use client";

import React from "react";
import {
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Combobox, type ComboboxOption } from "./combobox";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface BaseFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

interface TextFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  type?: "text" | "email" | "password" | "number" | "date";
}

interface TextareaFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  rows?: number;
}

interface SelectFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  options: Array<{ value: string; label: string }>;
}

interface ComboboxFieldProps<T extends FieldValues = FieldValues>
  extends BaseFieldProps<T> {
  options: ComboboxOption[];
  searchPlaceholder?: string;
  emptyText?: string;
}

export function TextField<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  disabled = false,
  required = false,
}: TextFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  rows = 3,
  disabled = false,
  required = false,
}: TextareaFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SelectField<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  required = false,
}: SelectFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ComboboxField<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  options,
  disabled = false,
  required = false,
}: ComboboxFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Combobox
              options={options}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyText={emptyText}
              disabled={disabled}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
