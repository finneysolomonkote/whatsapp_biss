import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Calendar, Clock } from 'lucide-react';
import type { Appointment, Contact, Service } from '../../types';

export const AppointmentsPage: React.FC = () => {
  const { tenant } = useAuth();
  const [appointments, setAppointments] = useState<
    (Appointment & { contact: Contact; service: Service })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!tenant) return;

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            contact:contacts(*),
            service:services(*)
          `)
          .eq('tenant_id', tenant.id)
          .order('slot_time', { ascending: true });

        if (error) throw error;
        setAppointments(data as any);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [tenant]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'default',
      no_show: 'warning',
    };
    return colors[status] || 'default';
  };

  const groupByDate = (apps: typeof appointments) => {
    const grouped: Record<string, typeof appointments> = {};
    apps.forEach((app) => {
      const date = new Date(app.slot_time).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(app);
    });
    return grouped;
  };

  const groupedAppointments = groupByDate(appointments);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
        <p className="text-gray-600">Manage your booking schedule</p>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="No appointments yet"
            description="Appointments booked through WhatsApp will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, apps]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{date}</h2>
              <Card>
                <div className="divide-y divide-gray-200">
                  {apps.map((appointment) => (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <p className="text-sm font-semibold text-gray-900">
                                {appointment.contact.first_name}{' '}
                                {appointment.contact.last_name}
                              </p>
                              <Badge variant={getStatusColor(appointment.status)} size="sm">
                                {appointment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {appointment.service.name}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(appointment.slot_time).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}{' '}
                              ({appointment.service.duration_minutes} min)
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                Note: {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
