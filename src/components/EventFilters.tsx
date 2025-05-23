
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface EventFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  showStatusFilter?: boolean;
}

const EventFilters: React.FC<EventFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedTags,
  onTagToggle,
  availableTags,
  showStatusFilter = true
}) => {
  return (
    <div className="space-y-4 p-4 glassmorphism rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-input border-border"
        />

        {showStatusFilter && (
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="declined">Recusados</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select onValueChange={(tag) => onTagToggle(tag)}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Filtrar por tag" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Tags selecionadas:</span>
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer">
              {tag}
              <X 
                className="w-3 h-3 ml-1" 
                onClick={() => onTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventFilters;
