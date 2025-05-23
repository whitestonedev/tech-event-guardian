
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Event } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface EventReviewModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (eventId: number, updatedEvent?: Partial<Event>) => void;
  onDecline: (eventId: number) => void;
}

const EventReviewModal: React.FC<EventReviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onApprove,
  onDecline
}) => {
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  React.useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
    }
  }, [event]);

  if (!event || !editedEvent) return null;

  const handleFieldChange = (field: keyof Event, value: any) => {
    setEditedEvent(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleIntlChange = (lang: 'pt-br' | 'en-us', field: string, value: string) => {
    setEditedEvent(prev => prev ? {
      ...prev,
      intl: {
        ...prev.intl,
        [lang]: {
          ...prev.intl[lang],
          [field]: value
        }
      }
    } : null);
  };

  const handleApprove = () => {
    if (showConfirmation) {
      onApprove(event.id, editedEvent);
      setShowConfirmation(false);
      onClose();
      toast({
        title: "Evento aprovado",
        description: "O evento foi aprovado com sucesso!",
      });
    } else {
      setShowConfirmation(true);
    }
  };

  const handleDecline = () => {
    onDecline(event.id);
    onClose();
    toast({
      title: "Evento recusado",
      description: "O evento foi recusado.",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glassmorphism">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Revisar Evento
          </DialogTitle>
        </DialogHeader>

        {showConfirmation ? (
          <div className="space-y-6 p-6 text-center">
            <h3 className="text-lg font-semibold">Confirmar Aprovação</h3>
            <p className="text-muted-foreground">
              Tem certeza que deseja aprovar este evento com as alterações realizadas?
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleApprove}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black"
              >
                Confirmar Aprovação
              </Button>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
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
                  onChange={(e) => handleFieldChange('event_name', e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Organização</Label>
                <Input
                  value={editedEvent.organization_name}
                  onChange={(e) => handleFieldChange('organization_name', e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Data/Hora de Início</Label>
                <Input
                  type="datetime-local"
                  value={editedEvent.start_datetime.slice(0, 16)}
                  onChange={(e) => handleFieldChange('start_datetime', e.target.value + ':00')}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Data/Hora de Fim</Label>
                <Input
                  type="datetime-local"
                  value={editedEvent.end_datetime.slice(0, 16)}
                  onChange={(e) => handleFieldChange('end_datetime', e.target.value + ':00')}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Link do Evento</Label>
                <Input
                  value={editedEvent.event_link}
                  onChange={(e) => handleFieldChange('event_link', e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2 flex items-center gap-2">
                <Switch
                  checked={editedEvent.online}
                  onCheckedChange={(checked) => handleFieldChange('online', checked)}
                />
                <Label>Evento Online</Label>
              </div>
            </div>

            {!editedEvent.online && (
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea
                  value={editedEvent.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  className="bg-input"
                />
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-semibold">Informações em Português</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custo</Label>
                  <Input
                    value={editedEvent.intl['pt-br'].cost}
                    onChange={(e) => handleIntlChange('pt-br', 'cost', e.target.value)}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Edição</Label>
                  <Input
                    value={editedEvent.intl['pt-br'].event_edition}
                    onChange={(e) => handleIntlChange('pt-br', 'event_edition', e.target.value)}
                    className="bg-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição Curta</Label>
                <Textarea
                  value={editedEvent.intl['pt-br'].short_description}
                  onChange={(e) => handleIntlChange('pt-br', 'short_description', e.target.value)}
                  className="bg-input"
                />
              </div>
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
              <Button 
                onClick={handleApprove}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black"
              >
                Aprovar Evento
              </Button>
              <Button variant="destructive" onClick={handleDecline}>
                Recusar Evento
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventReviewModal;
