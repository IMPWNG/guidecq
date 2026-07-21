type ProgressBarProps = {
    step: number
    total: number
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (step / total) * 100))

    return (
        <div className="w-full h-3 bg-ink/10 rounded-full overflow-hidden mb-8">
            <div
                className="h-full bg-apricot rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    )
}