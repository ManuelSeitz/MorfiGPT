"use client";
import { api } from "@/api/client";
import Button from "@/components/button";
import InputErrorMessage from "@/components/forms/error-message";
import Field from "@/components/forms/field";
import Input from "@/components/forms/input";
import Label from "@/components/forms/label";
import Modal from "@/components/modal";
import { useSession } from "@/stores/session";
import { Description, DialogTitle, useClose } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError, AuthenticatedUser } from "@repo/types/auth";
import axios from "axios";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import GoogleAuth from "./google";

const FormSchema = z
  .object({
    email: z.email({ error: "Dirección de correo inválida" }),
    password: z
      .string()
      .min(6, { error: "Se requieren al menos 6 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function SignupForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="rounded-2xl px-3 py-1.5 text-sm max-[480px]:hidden"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Registrate gratis
      </Button>
      <Modal
        closable
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        className="w-4/5 space-y-3"
      >
        <div className="space-y-1">
          <DialogTitle className="text-2xl font-bold">
            Registrate ahora
          </DialogTitle>
          <Description>
            Para acceder a funcionalidades exclusivas y más recetas por día.
          </Description>
        </div>
        <GoogleAuth>Registrate con Google</GoogleAuth>
        <div
          role="separator"
          className="relative flex items-center justify-center"
        >
          <div className="bg-primary-50 z-10 px-4">O</div>
          <hr className="border-primary-300 absolute w-full" />
        </div>
        <Form />
      </Modal>
    </>
  );
}

function Form() {
  const setUser = useSession((e) => e.setUser);
  const close = useClose();

  const {
    register,
    handleSubmit,
    setError,
    formState: { isDirty, errors },
  } = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async ({
    email,
    password,
  }) => {
    try {
      const res = await api.post<AuthenticatedUser>("/auth/signup", {
        email,
        password,
      });
      setUser(res.data);
      close();
    } catch (error) {
      if (axios.isAxiosError<ApiError>(error)) {
        const message =
          error.response?.data.message ?? "Credenciales inválidas";

        setError("email", { message });
      } else {
        setError("email", { message: "Error inesperado" });
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      className="flex flex-col gap-2"
    >
      <Field>
        <Label required>Correo electrónico</Label>
        <Input
          {...register("email")}
          type="email"
          placeholder="ejemplo@mail.com"
          data-error={errors.email ? true : undefined}
        />
        {errors.email && (
          <InputErrorMessage>{errors.email.message}</InputErrorMessage>
        )}
      </Field>
      <Field>
        <Label required>Contraseña</Label>
        <Input
          {...register("password")}
          type="password"
          data-error={errors.password ? true : undefined}
        />
        {errors.password && (
          <InputErrorMessage>{errors.password.message}</InputErrorMessage>
        )}
      </Field>
      <Field>
        <Label required>Repetir contraseña</Label>
        <Input
          {...register("confirmPassword")}
          type="password"
          data-error={errors.confirmPassword ? true : undefined}
        />
        {errors.confirmPassword && (
          <InputErrorMessage>
            {errors.confirmPassword.message}
          </InputErrorMessage>
        )}
      </Field>
      {isDirty && (
        <Button
          variant="primary"
          type="submit"
          className="mt-4 rounded-3xl py-2 text-lg"
        >
          Enviar
        </Button>
      )}
    </form>
  );
}
