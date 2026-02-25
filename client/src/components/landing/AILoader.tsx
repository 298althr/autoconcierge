'use client';

import React from 'react';
import { motion } from 'framer-motion';

const AILoader = () => {
    return (
        <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        height: [8, 24, 8],
                        opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    className="w-1 bg-burgundy rounded-full"
                />
            ))}
        </div>
    );
};

export default AILoader;
