import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export default function SeatLegend() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Seat Legend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-background border-2 border-primary/50 rounded flex items-center justify-center text-xs font-semibold">
            A1
          </div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="w-10 h-10 flex items-center justify-center text-xs">
            A2
          </Badge>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="w-10 h-10 flex items-center justify-center text-xs">
            A3
          </Badge>
          <span className="text-sm">Booked</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="w-10 h-10 flex items-center justify-center text-xs">
            A4
          </Badge>
          <span className="text-sm">Locked</span>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-sm">Window Seat</span>
        </div>
      </CardContent>
    </Card>
  );
}
