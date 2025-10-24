import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamCarousel({ orgData }: any) {
    const [currentTeamMember, setCurrentTeamMember] = useState(0);
    const [direction, setDirection] = useState(0);

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
            scale: 1.05,
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
    };

    const nextMember = () => {
        setDirection(1);
        setCurrentTeamMember((currentTeamMember + 1) % orgData.length);
    };

    const goToMember = (index: number) => {
        setDirection(index > currentTeamMember ? 1 : -1);
        setCurrentTeamMember(index);
    };

    return (
        <section className="relative h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 dark:from-primary dark:via-secondary dark:to-primary overflow-hidden flex flex-col justify-end py-28">
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
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                >
                    <h1 className="text-[12rem] md:text-[16rem] font-bold text-gray-300/20 dark:text-gray-700/20 uppercase tracking-wider select-none">
                        {orgData[currentTeamMember]?.name.split(" ")[0]}
                    </h1>
                </motion.div>
            </AnimatePresence>

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
                    className="absolute inset-0 flex items-center justify-center z-0"
                >
                    {orgData[currentTeamMember]?.image ? (
                        <img
                            src={orgData[currentTeamMember].image}
                            alt={orgData[currentTeamMember].name}
                            className="w-auto h-4/6 mx-auto object-cover object-center opacity-90 grayscale select-none pointer-events-none"
                        />
                    ) : (
                        <div
                            className={`w-full h-full bg-gradient-to-br ${orgData[currentTeamMember]?.color} opacity-20 blur-sm`}
                        ></div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 flex items-center justify-center gap-8 w-full mt-auto mb-12">
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
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            layoutId={`thumbnail-${i}`}
                        />
                    </motion.div>
                ))}

                <div className="relative">
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
                            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 w-80 flex flex-col items-center z-20"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.1,
                                }}
                                className="w-24 h-24 rounded-full border-4 border-secondary bg-primary/20 dark:bg-secondary/30 flex items-center justify-center shadow-lg -mt-20 mb-4"
                            >
                                {orgData[currentTeamMember]?.image ? (
                                    <img
                                        src={orgData[currentTeamMember].image}
                                        alt={orgData[currentTeamMember].name}
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`w-full h-full rounded-full bg-gradient-to-br ${orgData[currentTeamMember]?.color} flex items-center justify-center`}
                                    >
                                        <span className="text-white font-bold text-xl">
                                            {orgData[currentTeamMember]?.initials}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-bold text-primary dark:text-secondary mb-1"
                            >
                                {orgData[currentTeamMember]?.name}
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="text-secondary dark:text-primary font-semibold mb-1"
                            >
                                {orgData[currentTeamMember]?.role}
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-secondary dark:text-primary text-sm text-center leading-relaxed"
                            >
                                {orgData[currentTeamMember]?.bio}
                            </motion.p>
                            <motion.div
                                className="flex gap-4 justify-center mt-4"
                            >
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={prevMember}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/50 dark:bg-secondary/50 border border-primary/30 dark:border-secondary/30 text-primary dark:text-secondary shadow hover:bg-primary/20 dark:hover:bg-secondary/30 transition"
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
                                    whileTap={{ scale: 0.95 }}
                                    onClick={nextMember}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/50 dark:bg-secondary/50 border border-primary/30 dark:border-secondary/30 text-primary dark:text-secondary shadow hover:bg-primary/20 dark:hover:bg-secondary/30 transition"
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
                        </motion.div>
                    </AnimatePresence>
                </div>

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
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                    layoutId={`thumbnail-${actualIndex}`}
                                />
                            </motion.div>
                        );
                    })}
            </div>
        </section>
    );
}
