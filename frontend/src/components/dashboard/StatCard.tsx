
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  index: number;
  onClick?: () => void;
  className?: string;
}

const getGradientClass = (index: number) => {
  const gradients = [
    "from-blue-500 to-purple-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-500",
    "from-teal-500 to-cyan-500"
  ];
  return gradients[index % gradients.length];
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  index, 
  onClick,
  className 
}) => {
  return (
    <Card 
      className={`transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} opacity-10 rounded-xl`}></div>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium text-gray-600 dark:text-gray-300">{title}</CardTitle>
        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
