import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, ArrowRight, User } from 'lucide-react';
import { useLandingMoves, type HeroMove } from '../hooks/useLandingMoves';

const stats = [
  { value: '50+', label: 'COMPANIES TRACKED' },
  { value: '500+', label: 'AI TALENT MONITORED' },
  { value: '7', label: 'DATA SOURCES' },
  { value: '6h', label: 'UPDATE CYCLE' },
];

const sources = [
  'LinkedIn', 'GitHub', 'Semantic Scholar', 'X / Twitter',
  'Company Websites', 'arXiv Papers', 'News & RSS',
];

const pipeline = [
  {
    word: 'COLLECT',
    description: '7 automated collectors crawl LinkedIn, GitHub, Semantic Scholar, X, company sites, arXiv, and news feeds around the clock.',
  },
  {
    word: 'ANALYZE',
    description: 'AI correlates signals across sources, filters noise, and assigns confidence levels to every detected move.',
  },
  {
    word: 'SURFACE',
    description: 'Verified moves hit the draft board in real-time with AI-generated summaries explaining who moved and why it matters.',
  },
];

/* ─── Hero move card — shows a real recent move ─── */
function HeroMoveCard({ move, index }: { move: HeroMove; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 + index * 0.12, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-border rounded-[var(--radius-lg)] px-4 py-3"
    >
      {move.photoUrl ? (
        <img
          src={move.photoUrl}
          alt=""
          className="w-9 h-9 rounded-full object-cover shrink-0 border border-border"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
          <User size={14} className="text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${move.dotColor}`} />
          <span className={`font-body text-[0.625rem] font-700 tracking-[0.08em] uppercase ${move.typeColor}`}>
            {move.typeLabel}
          </span>
        </div>
        <p className="font-body text-sm text-foreground font-600 truncate">{move.personName}</p>
        <p className="font-body text-xs text-muted-foreground truncate">{move.description}</p>
      </div>
    </motion.div>
  );
}

/* ─── Animated counter component ─── */
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="text-center"
    >
      <span className="font-heading text-[clamp(3rem,10vw,7rem)] leading-none text-primary block">
        {value}
      </span>
      <span className="font-body text-[0.6875rem] font-600 tracking-[0.08em] text-muted-foreground mt-2 block">
        {label}
      </span>
    </motion.div>
  );
}

/* ─── Marquee ticker component ─── */
function TickerMarquee({ moves }: { moves: { type: string; text: string; color: string }[] }) {
  const items = [...moves, ...moves];

  return (
    <div className="overflow-hidden border-y border-border bg-card/50 py-3 relative z-10">
      <div className="animate-ticker flex whitespace-nowrap gap-12 hover:[animation-play-state:paused]">
        {items.map((move, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <Zap size={10} className="text-primary" />
            <span className={`font-body text-xs font-700 tracking-[0.05em] uppercase ${move.color}`}>
              {move.type}
            </span>
            <span className="text-muted-foreground text-xs font-body">
              {move.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Source marquee ─── */
function SourceMarquee() {
  const items = [...sources, ...sources, ...sources];

  return (
    <div className="overflow-hidden py-6 relative z-10">
      <div
        className="flex whitespace-nowrap gap-8 animate-ticker"
        style={{ animationDuration: '20s' }}
      >
        {items.map((source, i) => (
          <span
            key={i}
            className="font-heading text-[clamp(1.5rem,4vw,2.5rem)] text-muted-foreground/30 uppercase shrink-0"
          >
            {source}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function Landing() {
  const pipelineRef = useRef(null);
  const pipelineInView = useInView(pipelineRef, { once: true, amount: 0.2 });
  const { tickerMoves, heroMoves } = useLandingMoves();

  return (
    <div className="overflow-hidden relative">
      {/* ═══ BACKGROUND — dot grid + soft gradients ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="absolute w-[900px] h-[700px] top-[-15%] right-[-15%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200, 243, 29, 0.06) 0%, rgba(200, 243, 29, 0.015) 40%, transparent 70%)',
            animation: 'drift-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[700px] h-[600px] bottom-[5%] left-[-10%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 60%)',
            animation: 'drift-2 25s ease-in-out infinite',
          }}
        />
      </div>

      {/* ═══ HERO — two-column with live move cards ═══ */}
      <section className="min-h-[85vh] flex items-center px-4 sm:px-8 max-w-[1400px] mx-auto relative">
        <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16 py-16">
          {/* Left — headline + CTA */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[0.6875rem] font-700 tracking-[0.08em] uppercase px-3 py-1 rounded-[var(--radius-sm)]">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-glow" />
                  LIVE
                </span>
              </div>

              <h1 className="font-heading text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] tracking-[0.02em] uppercase">
                <span className="text-foreground">WHO'S </span>
                <span className="text-primary">MOVING</span>
                <br />
                <span className="text-foreground">IN AI</span>
                <span className="text-primary">?</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="mt-6 text-muted-foreground font-body text-[0.9375rem] max-w-lg leading-relaxed"
            >
              Real-time career intelligence across the AI industry. Know who's leaving,
              who's joining, and who's starting something new — before everyone else.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="mt-8"
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-700 text-[0.8125rem] tracking-[0.08em] uppercase px-6 py-3 rounded-[var(--radius-md)] hover:brightness-110 transition-all duration-[var(--duration-fast)] group"
              >
                VIEW THE DRAFT BOARD
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right — live move card preview */}
          {heroMoves.length > 0 && (
            <div className="w-full lg:w-[380px] shrink-0 space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex items-center gap-2 mb-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[0.625rem] font-700 tracking-[0.1em] uppercase text-muted-foreground">
                  LATEST MOVES
                </span>
              </motion.div>
              {heroMoves.map((move, i) => (
                <HeroMoveCard key={i} move={move} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ TICKER STRIP ═══ */}
      <TickerMarquee moves={tickerMoves} />

      {/* ═══ STATS — Large Typography ═══ */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <AnimatedStat value={stat.value} label={stat.label} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ SOURCE MARQUEE ═══ */}
      <SourceMarquee />

      {/* ═══ PIPELINE ═══ */}
      <section
        ref={pipelineRef}
        className="relative py-20 sm:py-28 px-4 sm:px-8 max-w-[1400px] mx-auto"
      >
        <div className="space-y-16 sm:space-y-24">
          {pipeline.map((step, i) => (
            <motion.div
              key={step.word}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              animate={pipelineInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              className={`flex flex-col ${i % 2 === 1 ? 'sm:items-end sm:text-right' : ''}`}
            >
              <h2 className="font-heading text-[clamp(3rem,10vw,7rem)] leading-[0.95] tracking-[0.03em] text-foreground">
                WE{' '}
                <span className="text-primary">{step.word}</span>
              </h2>
              <p className="mt-3 text-muted-foreground font-body text-[0.9375rem] max-w-md leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ SECOND TICKER ═══ */}
      <TickerMarquee moves={tickerMoves} />

      {/* ═══ CLOSING CTA ═══ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-8 max-w-[1400px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10"
        >
          <h2 className="font-heading text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] tracking-[0.03em] uppercase">
            <span className="text-foreground">STAY AHEAD</span>
            <br />
            <span className="text-foreground">OF THE </span>
            <span className="text-primary">DRAFT</span>
          </h2>
          <p className="mt-6 text-muted-foreground font-body text-[0.9375rem] max-w-md mx-auto">
            Free to browse. Sign in to suggest talent and upvote community picks.
          </p>
          <div className="mt-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-700 text-[0.8125rem] tracking-[0.08em] uppercase px-8 py-4 rounded-[var(--radius-md)] hover:brightness-110 transition-all duration-[var(--duration-fast)] group"
            >
              ENTER THE DRAFT BOARD
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border py-8 px-4 sm:px-8 relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            <span className="font-heading text-lg tracking-[0.05em] uppercase text-foreground">
              The AI Draft
            </span>
          </div>
          <span className="text-muted-foreground text-xs font-body">
            Real-time AI talent intelligence
          </span>
        </div>
      </footer>
    </div>
  );
}
