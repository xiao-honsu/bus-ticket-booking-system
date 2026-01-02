'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ShieldCheck, Zap } from 'lucide-react';

export default function PaymentMethods() {
  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader className="bg-linear-to-r from-muted/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Payment Method</CardTitle>
            <CardDescription>Secure payment via PayOS</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 p-4 border-2 border-primary/20 rounded-xl bg-linear-to-r from-primary/5 to-transparent">
          <div className="p-3 bg-primary/10 rounded-xl">
            <span className="text-3xl">💳</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">PayOS</span>
              <Badge variant="secondary" className="text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Secured
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Fast & secure online payment</p>
          </div>
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            <Zap className="h-3 w-3 mr-1" />
            Selected
          </Badge>
        </div>

        {/* Payment Features */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <ShieldCheck className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-xs text-muted-foreground">SSL Encrypted</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Zap className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-xs text-muted-foreground">Instant</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <CreditCard className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">All Cards</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
