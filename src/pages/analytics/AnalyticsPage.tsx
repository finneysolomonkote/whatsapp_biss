import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { TrendingUp, TrendingDown, Users, MessageSquare, Send, Calendar } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const metrics = [
    { label: 'Total Contacts', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Conversations', value: '856', change: '+8%', trend: 'up' },
    { label: 'Campaign Sent', value: '3,421', change: '+15%', trend: 'up' },
    { label: 'Appointments', value: '127', change: '-3%', trend: 'down' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your business performance and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Message Activity</h3>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization coming soon
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization coming soon
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Top Contacts</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Most active contacts will appear here</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Response Times</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Response Time</span>
                  <span className="text-sm font-semibold text-gray-900">2.5 hours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">First Response Time</span>
                  <span className="text-sm font-semibold text-gray-900">45 min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
