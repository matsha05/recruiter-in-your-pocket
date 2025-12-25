import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Eye, Clock } from "lucide-react"

interface SkimSimulatorProps {
    className?: string
}

/**
 * SkimSimulator
 * Simulates the "6-Second Scan" by blurring non-essential text and highlighting
 * key signals (Role, Company, Tenure) in sequence.
 */
export function SkimSimulator({ className }: SkimSimulatorProps) {
    const [step, setStep] = React.useState(0)

    // Cycle through steps: 0 (Blur), 1 (Title), 2 (Company), 3 (Dates), 4 (Impact)
    React.useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 5)
        }, 1500)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className={cn("relative overflow-hidden rounded-lg border border-border/10 bg-white shadow-sm select-none", className)}>

            {/* Overlay UI (Recruiter Brain) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md">
                <Eye className="h-3.5 w-3.5 text-brand" />
                <span>Recruiter View</span>
                <span className="ml-1 text-muted-foreground">|</span>
                <Clock className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-brand">0:0{(step + 1) * 1.2 > 6 ? 6 : Math.ceil((step + 1) * 1.2)}s</span>
            </div>

            {/* Resume Content Mock */}
            <div className="p-8 space-y-6 opacity-90 grayscale-[0.2]">

                {/* Header */}
                <div className="space-y-2 text-center">
                    <BlurLine active={true} width="40%" className="h-8 mx-auto bg-foreground" />
                    <BlurLine active={true} width="30%" className="h-4 mx-auto" />
                </div>

                <div className="border-t border-border/10 my-6" />

                {/* Experience Block 1 */}
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        {/* Title - Focus 1 */}
                        <Highlight active={step >= 1} label="Role">
                            <span className="text-lg font-bold text-foreground">Senior Product Manager</span>
                        </Highlight>

                        {/* Date - Focus 3 */}
                        <Highlight active={step >= 3} label="Tenure">
                            <span className="text-sm font-mono text-muted-foreground">2021 — Present</span>
                        </Highlight>
                    </div>

                    {/* Company - Focus 2 */}
                    <div className="-mt-2">
                        <Highlight active={step >= 2} label="Company">
                            <span className="text-base font-medium text-brand/90">Stripe</span>
                        </Highlight>
                    </div>

                    <ul className="space-y-2 pl-4">
                        <li className="text-sm relative pl-2 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">
                            {/* Impact - Focus 4 */}
                            <BlurText active={step !== 4}>
                                Spearheaded the launch of Payments 2.0, driving <span className="font-semibold text-foreground">$12M in annual revenue</span> within Q1.
                            </BlurText>
                        </li>
                        <li className="text-sm relative pl-2 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">
                            <BlurText active={true}>
                                Collaborated with engineering and design teams to optimize checkout flow reducing drop-off by 15%.
                            </BlurText>
                        </li>
                    </ul>
                </div>

                {/* Experience Block 2 */}
                <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-baseline">
                        <Highlight active={step >= 1} label="Role" delay={0.2}>
                            <span className="text-lg font-bold text-foreground">Product Manager</span>
                        </Highlight>

                        <Highlight active={step >= 3} label="Tenure" delay={0.2}>
                            <span className="text-sm font-mono text-muted-foreground">2018 — 2021</span>
                        </Highlight>
                    </div>
                </div>

            </div>
        </div>
    )
}

function Highlight({ active, children, label, delay = 0 }: { active: boolean, children: React.ReactNode, label?: string, delay?: number }) {
    return (
        <div className="relative inline-block">
            <div className={cn(
                "transition-all duration-300 rounded",
                active ? "bg-brand/10 ring-2 ring-brand ring-offset-2 ring-offset-white" : "opacity-30 blur-[1px]"
            )}>
                {children}
            </div>
            {active && label && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-6 left-0 bg-brand text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10"
                >
                    {label}
                </motion.div>
            )}
        </div>
    )
}

function BlurText({ active, children }: { active: boolean, children: React.ReactNode }) {
    return (
        <span className={cn(
            "transition-all duration-500",
            active ? "blur-[2.5px] opacity-40 select-none" : "blur-0 opacity-100 bg-yellow-50/50"
        )}>
            {children}
        </span>
    )
}

function BlurLine({ active, width, className }: { active: boolean, width: string, className?: string }) {
    return (
        <div
            style={{ width }}
            className={cn(
                "rounded-sm transition-all duration-500",
                active ? "bg-muted-foreground/20 blur-[1px]" : "bg-muted-foreground/20",
                className
            )}
        />
    )
}
