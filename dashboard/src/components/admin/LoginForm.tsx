"use client";
import { loginAuth } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/utils";
import { LoginFormValues, loginSchema } from "@/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Field, Input } from "../ui/form";
export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data: LoginFormValues) => {
    setSubmitError(null);
    try {
      await loginAuth(data);
      toast.success("Login Successfully");
      router.push("/admin");
    } catch (e) {
      setSubmitError(errorMessage(e));
    }
  });
  return (
    <div>
      {submitError && (
        <p className="bg-red-500/20 text-red-500 h-15 rounded-sm mt-4 flex items-center justify-center">
          {submitError}
        </p>
      )}
      <form onSubmit={onSubmit} noValidate className="space-y-6 mt-8">
        <Field
          label="Email"
          htmlFor="email"
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="off"
            error={errors.email?.message}
            {...register("email")}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="Password"
            type="password"
            autoComplete="off"
            error={errors.password?.message}
            {...register("password")}
          />
        </Field>
        <Button
          type="submit"
          className=" rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 cursor-pointer"
        >
          Login <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
