'use client';

import { CreditCard, Shield, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Integrate secure payment gateways for users to pay for their tickets',
    iconColor: 'text-blue-500',
  },
  {
    icon: Shield,
    title: 'Refund Policy',
    description: 'Offer options for the users to purchase refundable tickets with clear terms',
    iconColor: 'text-green-500',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Get assistance anytime through chat, email, or phone',
    iconColor: 'text-purple-500',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Our <span className="text-primary">Services</span>
          </h2>
        </div>

        <div className="gap-4 max-w-6xl mx-auto flex flex-wrap *:flex-[1_1_250px]">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border gap-0 py-0"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted p-3 rounded-lg border border-border">
                      <Icon className={`w-5 h-5 ${service.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-card-foreground mb-2">{service.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
