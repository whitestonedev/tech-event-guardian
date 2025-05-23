
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Globe, Building } from 'lucide-react';
import { Event } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  onReview?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
  showActions?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onReview, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);

  return (
    <Card className="glassmorphism hover:border-primary/50 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {event.event_name}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Building className="w-4 h-4" />
              <span className="text-sm">{event.organization_name}</span>
            </div>
          </div>
          <Badge 
            variant={event.status === 'approved' ? 'default' : 'secondary'}
            className={event.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}
          >
            {event.status === 'approved' ? 'Aprovado' : 'Pendente'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {format(startDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            {event.online ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span className="truncate">{event.address}</span>
              </>
            )}
          </div>
        </div>

        {event.intl?.['pt-br']?.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.intl['pt-br'].short_description}
          </p>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            {event.status === 'pending' && onReview && (
              <Button 
                size="sm" 
                onClick={() => onReview(event)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black"
              >
                Revisar
              </Button>
            )}
            {event.status === 'approved' && onEdit && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onEdit(event)}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onDelete(event.id)}
              >
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
