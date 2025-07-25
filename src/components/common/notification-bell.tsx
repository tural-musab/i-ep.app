'use client';

import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useNotifications, 
  formatNotificationTime, 
  getNotificationIcon, 
  getPriorityColor,
  type Notification 
} from '@/lib/realtime/notification-system';
import Link from 'next/link';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <Card className="absolute top-full right-0 mt-2 w-96 max-h-96 z-50 shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Bildirimler
                  {unreadCount > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {unreadCount} yeni
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      title="Tümünü okundu işaretle"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="mx-auto h-8 w-8 mb-2 text-gray-300" />
                  <p>Henüz bildirim yok</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Notification Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium text-gray-900 ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="mt-2 flex items-center space-x-2">
                                <span className="text-xs text-gray-400">
                                  {formatNotificationTime(notification.timestamp)}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority === 'urgent' ? 'Acil' :
                                   notification.priority === 'high' ? 'Yüksek' :
                                   notification.priority === 'normal' ? 'Normal' : 'Düşük'}
                                </Badge>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  title="Okundu işaretle"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                title="Kaldır"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Action Link */}
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800"
                              onClick={() => setIsOpen(false)}
                            >
                              Görüntüle →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-gray-50">
                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Tüm Bildirimleri Görüntüle
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default NotificationBell;