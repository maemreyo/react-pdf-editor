import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const createFormSchema = <T extends z.ZodType>(schema: T) => {
  return {
    schema,
    useFormWithSchema: (defaultValues?: z.infer<T>) => {
      return useForm({
        resolver: zodResolver(schema),
        defaultValues,
      });
    },
  };
};
