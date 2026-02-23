'use client';

import React from 'react';
import { ShieldCheck, Star, Award, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserAchievement {
    achievement: {
        title: string;
        description: string;
        iconUrl: string;
    };
}

interface UserIdentityBadgeProps {
    user: {
        id: string;
        fullName: string;
        globalTrustScore: number;
        completedTrades: number;
        country?: string;
        idCardStatus?: string;
        verificationLevel?: number;
        userAchievements?: UserAchievement[];
        isRestricted?: boolean;
    };
    size?: 'sm' | 'md' | 'lg';
    showCountry?: boolean;
}

export const UserIdentityBadge: React.FC<UserIdentityBadgeProps> = ({
    user,
    size = 'md',
    showCountry = true
}) => {
    const getTrustColor = (score: number) => {
        if (score >= 4.0) return 'text-green-600 border-green-200 bg-green-50';
        if (score >= 3.0) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
        if (score >= 2.0) return 'text-orange-600 border-orange-200 bg-orange-50';
        return 'text-red-600 border-red-200 bg-red-50';
    };

    const isVerified = user.idCardStatus === 'VERIFIED';

    const sizes = {
        sm: {
            container: 'p-2 gap-2',
            avatar: 'w-8 h-8 text-xs',
            name: 'text-sm',
            stats: 'text-[10px]',
            icon: 'h-3 w-3',
            badge: 'h-4 w-4'
        },
        md: {
            container: 'p-3 gap-3',
            avatar: 'w-10 h-10 text-sm',
            name: 'text-base',
            stats: 'text-xs',
            icon: 'h-4 w-4',
            badge: 'h-5 w-5'
        },
        lg: {
            container: 'p-4 gap-4',
            avatar: 'w-12 h-12 text-base',
            name: 'text-lg',
            stats: 'text-sm',
            icon: 'h-5 w-5',
            badge: 'h-6 w-6'
        }
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex items-center ${currentSize.container} bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm`}>
            {/* Avatar / Initials */}
            <div className={`${currentSize.avatar} rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 shrink-0`}>
                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`font-bold text-slate-900 dark:text-white truncate ${currentSize.name}`}>
                        {user.fullName}
                    </span>
                    {isVerified && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <ShieldCheck className={`${currentSize.badge} text-blue-500 fill-blue-50`} />
                                </TooltipTrigger>
                                <TooltipContent>ID Verified Member</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 ${currentSize.stats}`}>
                    {/* Trust Score */}
                    <div className="flex items-center gap-1">
                        <Star className={`${currentSize.icon} text-yellow-500 fill-yellow-500`} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {user.globalTrustScore.toFixed(1)}
                        </span>
                    </div>

                    {/* Trade Count */}
                    <div className="flex items-center gap-1">
                        <Award className={`${currentSize.icon} text-slate-400`} />
                        <span>{user.completedTrades} Trades</span>
                    </div>

                    {/* Country */}
                    {showCountry && user.country && (
                        <div className="flex items-center gap-1">
                            <MapPin className={currentSize.icon} />
                            <span>{user.country}</span>
                        </div>
                    )}
                </div>

                {/* Achievement Badges */}
                {user.userAchievements && user.userAchievements.length > 0 && (
                    <div className="flex gap-1 mt-2">
                        {user.userAchievements.slice(0, 3).map((ua, idx) => (
                            <TooltipProvider key={idx}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shadow-sm hover:scale-110 transition-transform cursor-help">
                                            {ua.achievement.iconUrl || '🎖️'}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold text-xs">{ua.achievement.title}</p>
                                        <p className="text-[10px] opacity-80">{ua.achievement.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                        {user.userAchievements.length > 3 && (
                            <div className="text-[10px] text-slate-400 self-center ml-1">
                                +{user.userAchievements.length - 3} more
                            </div>
                        )}
                    </div>
                )}
            </div>

            {user.isRestricted && (
                <div className="absolute top-2 right-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="text-slate-400">🔒</span>
                            </TooltipTrigger>
                            <TooltipContent>Privacy Mode Active</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
};

export default UserIdentityBadge;
