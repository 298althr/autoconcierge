'use client';

import React from 'react';
import { motion } from 'framer-motion';

const AILoader = () => {
    return (
        <div className="flex items-center gap-1 h-6 w-8 justify-center">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        scaleY: [0.3, 1, 0.3],
                        opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    className="w-1 h-full bg-burgundy rounded-full origin-center"
                    style={{ willChange: 'transform, opacity' }}
                />
            ))}
        </div>
    );
};

export default AILoader;
