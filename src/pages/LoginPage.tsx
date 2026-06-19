import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "../auth/AuthContext";
import { isAdministrator } from "../auth/roleUtils";
import { getApiErrorMessage } from "../utils/apiError";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const schema = z.object({
    email: z.string().min(1, t("validation.required")).email(t("validation.email")),
    password: z.string().min(1, t("validation.passwordMin")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);

    try {
      const user = await login(values.email, values.password);
      navigate(isAdministrator(user.role) ? "/admin" : "/app", { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t));
    }
  });

  return (
    <div className="sas-login-page">
      <Container className="sas-login-card">
        <Paper className="sas-card" p="xl" radius="md">
          <Stack gap="md">
            <div>
              <Title order={2}>{t("login.title")}</Title>
              <Text c="dimmed" size="sm">
                {t("login.subtitle")}
              </Text>
            </div>

            {errorMessage ? (
              <Alert color="red" variant="light">
                {errorMessage}
              </Alert>
            ) : null}

            <form onSubmit={onSubmit}>
              <Stack gap="md">
                <TextInput
                  label={t("login.email")}
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <PasswordInput
                  label={t("login.password")}
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />

                <Button type="submit" loading={isSubmitting} fullWidth>
                  {t("login.submit")}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
