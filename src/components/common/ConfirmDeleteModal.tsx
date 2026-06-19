import { Button, Group, Modal, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface ConfirmDeleteModalProps {
  opened: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeleteModal({
  opened,
  title,
  message,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Text mb="lg">{message}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>
          {t("common.cancel")}
        </Button>
        <Button color="red" loading={loading} onClick={onConfirm}>
          {t("common.delete")}
        </Button>
      </Group>
    </Modal>
  );
}
