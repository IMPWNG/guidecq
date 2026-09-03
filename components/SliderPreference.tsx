type Level = {
    value: number
    text: string
}

type Props = {
    label: string
    emoji: string
    description: string
    value: number
    onChange: (v: number) => void
    levels: readonly Level[]
}

export default function SliderPreference({
    label,
    emoji,
    description,
    value,
    onChange,
    levels,
}: Props) {
    return (
        <div className="mb-6 pb-6 border-b border-ink/5 last:border-none">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{emoji}</span>
                <div>
                    <p className="font-semibold text-ink">{label}</p>
                    <p className="text-xs text-ink/50">{description}</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mt-3">
                {levels.map((level) => (
                    <button
                        key={level.value}
                        type="button"
                        onClick={() => onChange(level.value)}
                        className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 transition text-center ${
                            value === level.value
                                ? 'bg-apricot border-apricot text-white shadow-md scale-105'
                                : 'bg-white border-ink/10 text-ink/50 hover:border-apricot/40'
                        }`}
                    >
                        <span className="text-lg font-bold">{level.value}</span>
                        <span className="text-[10px] leading-tight mt-0.5">{level.text}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
