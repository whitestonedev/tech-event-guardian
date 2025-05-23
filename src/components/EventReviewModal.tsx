import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Event } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { DateTimePicker } from "./DateTimePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventReviewModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (eventId: number, updatedEvent?: Partial<Event>) => void;
  onDecline: (eventId: number) => void;
}

type IntlField = "banner_link" | "cost" | "event_edition" | "short_description";
type EventStatus = "requested" | "approved" | "declined";

const AVAILABLE_LANGUAGES = {
  "pt-br": "Português",
  "en-us": "Inglês",
  "es-es": "Espanhol",
} as const;

const CURRENCY_FORMATS = {
  "pt-br": {
    currency: "BRL",
    locale: "pt-BR",
  },
  "en-us": {
    currency: "USD",
    locale: "en-US",
  },
  "es-es": {
    currency: "MXN",
    locale: "es-MX",
  },
} as const;

const formatCurrency = (
  value: string,
  langCode: keyof typeof AVAILABLE_LANGUAGES
) => {
  if (!value) return "";
  // Remove qualquer caractere que não seja número
  const numbers = value.replace(/\D/g, "");
  // Converte para número e divide por 100 para ter os centavos
  const amount = Number(numbers) / 100;
  // Formata o valor com a moeda correta
  const format = CURRENCY_FORMATS[langCode];
  return new Intl.NumberFormat(format.locale, {
    style: "currency",
    currency: format.currency,
  }).format(amount);
};

const EventReviewModal: React.FC<EventReviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onApprove,
  onDecline,
}) => {
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<
    "approve" | "decline" | "edit" | null
  >(null);

  React.useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
    }
  }, [event, isOpen]);

  if (!event || !editedEvent) {
    return null;
  }

  const handleFieldChange = (field: keyof Event, value: string | boolean) => {
    setEditedEvent((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleIntlChange = (lang: string, field: IntlField, value: string) => {
    setEditedEvent((prev) =>
      prev
        ? {
            ...prev,
            intl: {
              ...prev.intl,
              [lang]: {
                ...prev.intl[lang],
                [field]:
                  field === "cost"
                    ? formatCurrency(
                        value,
                        lang as keyof typeof AVAILABLE_LANGUAGES
                      )
                    : value,
              },
            },
          }
        : null
    );
  };

  const handleAddLanguage = (langCode: keyof typeof AVAILABLE_LANGUAGES) => {
    setEditedEvent((prev) =>
      prev
        ? {
            ...prev,
            intl: {
              ...prev.intl,
              [langCode]: {
                banner_link: "",
                cost: "",
                event_edition: "",
                short_description: "",
              },
            },
          }
        : null
    );
  };

  const handleRemoveLanguage = (langCode: string) => {
    setEditedEvent((prev) => {
      if (!prev) return null;
      const newIntl = { ...prev.intl };
      delete newIntl[langCode];
      return { ...prev, intl: newIntl };
    });
  };

  const handleSave = () => {
    if (showConfirmation) {
      const hasChanges = Object.keys(editedEvent).some((key) => {
        if (key === "intl") {
          return (
            JSON.stringify(editedEvent.intl) !== JSON.stringify(event.intl)
          );
        }
        return editedEvent[key as keyof Event] !== event[key as keyof Event];
      });

      if (hasChanges) {
        onApprove(event.id, editedEvent);
        toast({
          title: "Evento atualizado",
          description: "As alterações foram salvas com sucesso!",
        });
      }
      setShowConfirmation(false);
      setConfirmationType(null);
      onClose();
    } else {
      setShowConfirmation(true);
      setConfirmationType("edit");
    }
  };

  const handleStatusChange = (newStatus: EventStatus) => {
    setEditedEvent((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  const handleApprove = () => {
    if (showConfirmation) {
      const hasChanges = Object.keys(editedEvent).some((key) => {
        if (key === "intl") {
          return (
            JSON.stringify(editedEvent.intl) !== JSON.stringify(event.intl)
          );
        }
        return editedEvent[key as keyof Event] !== event[key as keyof Event];
      });

      onApprove(event.id, hasChanges ? editedEvent : undefined);
      setShowConfirmation(false);
      setConfirmationType(null);
      onClose();
      toast({
        title: "Evento aprovado",
        description: "O evento foi aprovado com sucesso!",
      });
    } else {
      setShowConfirmation(true);
      setConfirmationType("approve");
    }
  };

  const handleDecline = () => {
    if (showConfirmation) {
      onDecline(event.id);
      setShowConfirmation(false);
      setConfirmationType(null);
      onClose();
      toast({
        title: "Evento recusado",
        description: "O evento foi recusado.",
        variant: "destructive",
      });
    } else {
      setShowConfirmation(true);
      setConfirmationType("decline");
    }
  };

  const getAvailableLanguages = () => {
    if (!editedEvent) return [];
    return Object.keys(AVAILABLE_LANGUAGES).filter(
      (lang) => !editedEvent.intl[lang]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-green-500">
            {event.status === "approved" ? "Editar Evento" : "Revisar Evento"}
          </DialogTitle>
        </DialogHeader>

        {showConfirmation ? (
          <div className="space-y-6 p-6 text-center">
            <h3 className="text-lg font-semibold">
              {confirmationType === "edit"
                ? "Confirmar Alterações"
                : confirmationType === "approve"
                ? "Confirmar Aprovação"
                : "Confirmar Recusa"}
            </h3>
            <p className="text-muted-foreground">
              {confirmationType === "edit"
                ? "Tem certeza que deseja salvar as alterações realizadas neste evento?"
                : confirmationType === "approve"
                ? "Tem certeza que deseja aprovar este evento com as alterações realizadas?"
                : "Tem certeza que deseja recusar este evento?"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={
                  confirmationType === "edit"
                    ? handleSave
                    : confirmationType === "approve"
                    ? handleApprove
                    : handleDecline
                }
                className={
                  confirmationType === "edit"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : confirmationType === "approve"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
              >
                {confirmationType === "edit"
                  ? "Salvar Alterações"
                  : confirmationType === "approve"
                  ? "Confirmar Aprovação"
                  : "Confirmar Recusa"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmationType(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Evento</Label>
                <Input
                  value={editedEvent.event_name}
                  onChange={(e) =>
                    handleFieldChange("event_name", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Organização</Label>
                <Input
                  value={editedEvent.organization_name}
                  onChange={(e) =>
                    handleFieldChange("organization_name", e.target.value)
                  }
                />
              </div>

              <DateTimePicker
                label="Data/Hora de Início"
                value={editedEvent.start_datetime.slice(0, 16)}
                onChange={(value) => handleFieldChange("start_datetime", value)}
              />

              <DateTimePicker
                label="Data/Hora de Fim"
                value={editedEvent.end_datetime.slice(0, 16)}
                onChange={(value) => handleFieldChange("end_datetime", value)}
              />

              <div className="space-y-2">
                <Label>Link do Evento</Label>
                <Input
                  value={editedEvent.event_link}
                  onChange={(e) =>
                    handleFieldChange("event_link", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Link do Maps</Label>
                <Input
                  value={editedEvent.maps_link}
                  onChange={(e) =>
                    handleFieldChange("maps_link", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 flex items-center gap-2">
                <Switch
                  checked={editedEvent.online}
                  onCheckedChange={(checked) =>
                    handleFieldChange("online", checked)
                  }
                />
                <Label>Evento Online</Label>
              </div>

              {event.status === "approved" && (
                <div className="space-y-2">
                  <Label>Status do Evento</Label>
                  <Select
                    value={editedEvent.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requested">Solicitado</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="declined">Recusado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {!editedEvent.online && (
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea
                  value={editedEvent.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Informações por Idioma</h4>
                {getAvailableLanguages().length > 0 && (
                  <Select
                    onValueChange={(value) =>
                      handleAddLanguage(
                        value as keyof typeof AVAILABLE_LANGUAGES
                      )
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Adicionar tradução" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableLanguages().map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {
                            AVAILABLE_LANGUAGES[
                              lang as keyof typeof AVAILABLE_LANGUAGES
                            ]
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {Object.entries(editedEvent.intl).map(([langCode, langData]) => (
                <div key={langCode} className="space-y-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">
                      {AVAILABLE_LANGUAGES[
                        langCode as keyof typeof AVAILABLE_LANGUAGES
                      ] || langCode.toUpperCase()}
                    </h5>
                    {langCode !== "pt-br" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveLanguage(langCode)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Link do Banner</Label>
                      <Input
                        value={langData.banner_link}
                        onChange={(e) =>
                          handleIntlChange(
                            langCode,
                            "banner_link",
                            e.target.value
                          )
                        }
                      />
                      {langData.banner_link && (
                        <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden border">
                          <img
                            src={langData.banner_link}
                            alt={`Banner ${langCode}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://placehold.co/600x400/EFFAF1/8F8F8F?text=Imagem+não+encontrada";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Custo</Label>
                      <Input
                        value={langData.cost}
                        onChange={(e) =>
                          handleIntlChange(langCode, "cost", e.target.value)
                        }
                        placeholder={
                          langCode === "pt-br"
                            ? "R$ 0,00"
                            : langCode === "en-us"
                            ? "$0.00"
                            : "MX$0.00"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Edição</Label>
                      <Input
                        value={langData.event_edition}
                        onChange={(e) =>
                          handleIntlChange(
                            langCode,
                            "event_edition",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição Curta</Label>
                    <Textarea
                      value={langData.short_description}
                      onChange={(e) =>
                        handleIntlChange(
                          langCode,
                          "short_description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {editedEvent.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {event.status === "approved" ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleApprove}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Aprovar Evento
                  </Button>
                  <Button variant="destructive" onClick={handleDecline}>
                    Recusar Evento
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventReviewModal;
