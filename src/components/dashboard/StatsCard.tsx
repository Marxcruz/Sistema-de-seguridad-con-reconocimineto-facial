'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: LucideIcon
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue' 
}: StatsCardProps) {
  const gradientClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-orange-500',
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[color]} opacity-90`}></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-white opacity-90">
          {title}
        </CardTitle>
        <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-white mt-2">{value}</div>
        {change && (
          <p className="text-xs text-white opacity-90 mt-2">
            {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}% desde ayer
          </p>
        )}
      </CardContent>
    </Card>
  )
}
