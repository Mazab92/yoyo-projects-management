import React from 'react';
import { motion } from 'framer-motion';

const BouncingLoader: React.FC = () => (
    <div className="flex items-center justify-center w-full h-full p-4 space-x-2">
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className={`w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-primary' : 'bg-emerald-500'}`}
                animate={{ y: ["0%", "-100%", "0%"] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
        ))}
    </div>
);

export default BouncingLoader;
