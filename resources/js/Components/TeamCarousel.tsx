import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
    id?: number;
    name: string;
    role: string;
    bio: string;
    image?: string;
    initials?: string;
    color?: string;
}

interface TeamCarouselProps {
    orgData: TeamMember[];
    autoPlayInterval?: number; // milliseconds
}

export default function TeamCarousel({ orgData, autoPlayInterval = 5000 }: TeamCarouselProps) {
    const [currentTeamMember, setCurrentTeamMember] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // Infinite auto-loop logic
    useEffect(() => {
        if (!isPaused && orgData.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setDirection(1);
                setCurrentTeamMember((prev) => (prev + 1) % orgData.length);
            }, autoPlayInterval);
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isPaused, orgData.length, autoPlayInterval]);

    // Pause auto-play on hover
    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
        }),
    };

    const cardVariants = {
        enter: (direction: number) => ({
            y: direction > 0 ? 50 : -50,
            opacity: 0,
            scale: 0.8,
            rotateY: direction > 0 ? 45 : -45,
        }),
        center: {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
        },
        exit: (direction: number) => ({
            y: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.8,
            rotateY: direction < 0 ? 45 : -45,
        }),
    };

    const thumbnailVariants = {
        inactive: {
            scale: 1,
            opacity: 0.7,
        },
        active: {
            scale: 1.2,
            opacity: 1,
        },
    };

    const prevMember = () => {
        setDirection(-1);
        setCurrentTeamMember(
            (currentTeamMember - 1 + orgData.length) % orgData.length
        );
        setIsPaused(false); // Resume auto-play after manual navigation
    };

    const nextMember = () => {
        setDirection(1);
        setCurrentTeamMember((currentTeamMember + 1) % orgData.length);
        setIsPaused(false); // Resume auto-play after manual navigation
    };

    const goToMember = (index: number) => {
        setDirection(index > currentTeamMember ? 1 : -1);
        setCurrentTeamMember(index);
        setIsPaused(false); // Resume auto-play after manual navigation
    };

    return (
        <section className="relative min-h-screen bg-white dark:bg-gray-900 overflow-hidden flex flex-col justify-between py-8 md:py-20">
            {/* Background Text - Hidden on mobile */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={`bg-text-${currentTeamMember}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.4 },
                        scale: { duration: 0.4 },
                    }}
                    className="absolute top-8 md:top-16 left-0 right-0 hidden md:flex items-center justify-center pointer-events-none z-0"
                >
                    <h1 className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold text-gray-300/20 dark:text-gray-700/20 uppercase tracking-wider select-none">
                        {orgData[currentTeamMember]?.name.split(" ")[0]}
                    </h1>
                </motion.div>
            </AnimatePresence>

            {/* Background Image */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={`bg-image-${currentTeamMember}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.5 },
                        scale: { duration: 0.5 },
                    }}
                    className="absolute top-0 left-0 right-0 bottom-32 sm:bottom-40 lg:bottom-[200px] flex items-center justify-center z-0"
                >
                    {orgData[currentTeamMember]?.image ? (
                        <img
                            src={orgData[currentTeamMember].image}
                            alt={orgData[currentTeamMember].name}
                            className="w-auto h-full max-h-[60vh] md:max-h-[65vh] mx-auto object-contain object-center opacity-40 md:opacity-90 grayscale select-none pointer-events-none"
                        />
                    ) : (
                        <div
                            className={`w-full h-full bg-gradient-to-br ${orgData[currentTeamMember]?.color || 'from-secondary to-primary'} opacity-20 blur-sm`}
                        ></div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Main Content */}
            <div 
                className="relative z-10 flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 w-full px-4 mt-auto"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Left Thumbnails - Hidden on mobile, shown on desktop */}
                <div className="hidden md:flex gap-4 items-end mb-4">
                    {orgData.slice(0, Math.floor(orgData.length / 2)).map((member: any, i: number) => (
                        <motion.div
                            key={i}
                            variants={thumbnailVariants}
                            initial="inactive"
                            animate={currentTeamMember === i ? "active" : "inactive"}
                            whileHover={{ scale: 1.1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={() => goToMember(i)}
                            className="cursor-pointer"
                        >
                            <motion.img
                                src={member.image}
                                alt={member.name}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300"
                                layoutId={`thumbnail-${i}`}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Center Card */}
                <div className="relative w-full max-w-sm md:max-w-md mb-4">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentTeamMember}
                            custom={direction}
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                y: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.3 },
                                scale: { duration: 0.3 },
                                rotateY: { duration: 0.4 },
                            }}
                            className="border-secondary/40 bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground rounded-2xl p-6 md:p-8 w-full flex flex-col items-center z-20"
                            style={{ transformStyle: "flat" }}
                        >
                            {/* Profile Image */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.1,
                                }}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-secondary bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg -mt-16 md:-mt-20 mb-4"
                            >
                                {orgData[currentTeamMember]?.image ? (
                                    <img
                                        src={orgData[currentTeamMember].image}
                                        alt={orgData[currentTeamMember].name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`w-full h-full rounded-full bg-gradient-to-br ${orgData[currentTeamMember]?.color || 'from-secondary to-primary'} flex items-center justify-center`}
                                    >
                                        <span className="text-white font-bold text-lg md:text-xl">
                                            {orgData[currentTeamMember]?.initials}
                                        </span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Member Details */}
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl font-bold text-primary dark:text-secondary mb-1 text-center"
                            >
                                {orgData[currentTeamMember]?.name}
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="text-secondary dark:text-primary font-semibold mb-3 text-sm md:text-base text-center"
                            >
                                {orgData[currentTeamMember]?.role}
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-muted-foreground text-xs md:text-sm text-center leading-relaxed mb-4"
                            >
                                {orgData[currentTeamMember]?.bio}
                            </motion.p>

                            {/* Navigation Buttons */}
                            <motion.div className="flex gap-4 justify-center mt-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={prevMember}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground shadow-sm hover:shadow-md transition-shadow duration-300 border border-secondary/40"
                                    aria-label="Previous member"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={nextMember}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground shadow-sm hover:shadow-md transition-shadow duration-300 border border-secondary/40"
                                    aria-label="Next member"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </motion.button>
                            </motion.div>

                            {/* Auto-play indicator */}
                            <div className="flex items-center gap-2 mt-4">
                                <div className="flex gap-1">
                                    {orgData.map((_, index) => (
                                        <motion.button
                                            key={index}
                                            onClick={() => goToMember(index)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                currentTeamMember === index 
                                                    ? 'w-8 bg-gradient-to-r from-secondary to-primary' 
                                                    : 'w-1.5 bg-secondary/30 hover:bg-secondary/50'
                                            }`}
                                            aria-label={`Go to ${orgData[index].name}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Pause/Play indicator (optional) */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsPaused(!isPaused)}
                                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                {isPaused ? (
                                    <>
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                        <span>Play</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                        </svg>
                                        <span>Pause</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Thumbnails - Hidden on mobile, shown on desktop */}
                <div className="hidden md:flex gap-4 items-end mb-4">
                    {orgData
                        .slice(Math.floor(orgData.length / 2) + 1)
                        .map((member: any, i: number) => {
                            const actualIndex = Math.floor(orgData.length / 2) + 1 + i;
                            return (
                                <motion.div
                                    key={actualIndex}
                                    variants={thumbnailVariants}
                                    initial="inactive"
                                    animate={
                                        currentTeamMember === actualIndex ? "active" : "inactive"
                                    }
                                    whileHover={{ scale: 1.1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    onClick={() => goToMember(actualIndex)}
                                    className="cursor-pointer"
                                >
                                    <motion.img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300"
                                        layoutId={`thumbnail-${actualIndex}`}
                                    />
                                </motion.div>
                            );
                        })}
                </div>

                {/* Mobile Thumbnail Grid - Visible only on mobile */}
                <div className="md:hidden flex flex-wrap justify-center gap-3 mt-6 max-w-sm">
                    {orgData.map((member: any, index: number) => (
                        <motion.div
                            key={index}
                            variants={thumbnailVariants}
                            initial="inactive"
                            animate={currentTeamMember === index ? "active" : "inactive"}
                            whileHover={{ scale: 1.1, opacity: 1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={() => goToMember(index)}
                            className="cursor-pointer"
                        >
                            <motion.img
                                src={member.image}
                                alt={member.name}
                                className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm transition-all duration-300 ${
                                    currentTeamMember === index 
                                        ? 'border-primary shadow-md' 
                                        : 'border-secondary/40'
                                }`}
                                layoutId={`thumbnail-mobile-${index}`}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}