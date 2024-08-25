import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

export default function InputFormField({
  form,
  label,
  name,
  placeholder,
  type,
}: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                className="ring-0 focus:ring-0 h-[50px]"
                placeholder={placeholder}
                type={type}
                {...field}
              />
            </FormControl>
            <FormMessage />
        </FormItem>
      )}
    />
  );
}
