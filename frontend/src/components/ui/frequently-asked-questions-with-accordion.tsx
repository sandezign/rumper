"use client";

import React from "react";
import { motion } from "motion/react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FrequentlyAskedQuestionsProps {
  badge?: string;
  title?: string;
  description?: React.ReactNode;
  data?: FAQItem[];
  className?: string;
  supportEmail?: string;
  defaultValue?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Apakah Rumper membaca atau menyimpan data pribadi saya?",
    answer:
      "Rumper mengedepankan privasi. Seluruh pencarian lokasi, audit lingkungan, dan simulasi commute diproses secara aman tanpa membagikan riwayat pencarian Anda ke pihak ketiga atau broker properti.",
  },
  {
    question: "Dari mana Rumper mendapatkan data risiko lokasi?",
    answer:
      "Rumper menyatukan 4 sumber data geospasial resmi: peta kerawanan banjir nasional & historis, batas zonasi tata ruang wilayah, simulasi waktu tempuh jam sibuk, serta pemetaan perimeter infrastruktur (SUTET, rel, TPA). Seluruh temuan dihitung murni secara objektif demi kepentingan pembeli tanpa sponsor atau komisi developer.",
  },
  {
    question: "Apakah Rumper menggantikan survei fisik langsung?",
    answer:
      "Sama sekali tidak. Rumper justru membekali Anda dengan contekan investigasi lapangan sebelum berangkat ke lokasi. Data geospasial menyajikan peta makro (riwayat potensi banjir, perimeter aman SUTET, dan waktu tempuh jam kerja), sementara kondisi mikro seperti perawatan pompa air klaster dan kebersihan saluran warga tetap wajib dibuktikan langsung.",
  },
  {
    question: "Apakah Rumper bekerja sama dengan developer atau agen properti?",
    answer:
      "100% independen. Rumper tidak menjual unit rumah, tidak menerima komisi transaksi, dan tidak menampilkan iklan perumahan bersponsor. Skor lokasi dan analisis risiko disajikan objektif untuk melindungi uang Anda sebelum membayar tanda jadi atau DP.",
  },
  {
    question: 'Apa maksud prinsip "Data Kosong Bukan Berarti Aman" (Celah Bukti)?',
    answer:
      'Banyak portal menganggap wilayah tanpa riwayat laporan bencana sebagai area yang aman. Rumper menolak rasa aman semu itu. Jika suatu titik perumahan belum memiliki data sensor resmi yang memadai, kami menandainya secara jujur sebagai Celah Bukti (Evidence Gap) dan memberi Anda panduan pertanyaan konfirmasi untuk satpam dan pengurus RT/RW.',
  },
  {
    question: "Berapa lama laporan audit risiko lokasi dibuat?",
    answer:
      "Laporan awal tersaji instan dalam hitungan detik setelah Anda memilih titik pin lokasi atau nama klaster. Untuk laporan lengkap yang mencakup checklist investigasi lapangan dapat Anda simpan atau unduh sebagai bekal saat tinjau lokasi.",
  },
];

export default function FrequentlyAskedQuestions({
  badge = "FAQ",
  title = "Pertanyaan yang sering muncul",
  description,
  data = defaultFAQs,
  className,
  supportEmail = "halo@rumper.id",
  defaultValue = "item-1",
}: FrequentlyAskedQuestionsProps) {
  return (
    <section
      id="faq"
      className={cn(
        "relative w-full overflow-hidden py-16 sm:py-20 md:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Centered Header Section */}
        <div className="text-center flex flex-col items-center">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="mb-3.5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[#001e2b] uppercase bg-emerald-50/90 border border-emerald-200/70"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ed64] ring-2 ring-[#00ed64]/30" />
              <span>{badge}</span>
            </motion.div>
          )}

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-[-0.03em] leading-[1.14] text-[#001e2b] max-w-2xl"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-3.5 text-[15px] sm:text-base text-[#5c6c7a] leading-relaxed max-w-lg"
          >
            {description ? (
              description
            ) : (
              <>
                Masih ada yang bikin ragu? Kirim pesan ke{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-bold text-[#001e2b] hover:text-[#00684a] underline underline-offset-4 decoration-2 decoration-emerald-300 transition-colors"
                >
                  {supportEmail}
                </a>
                .
              </>
            )}
          </motion.p>
        </div>

        {/* Centered Accordions Stack */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-10 sm:mt-12 w-full"
        >
          <AccordionPrimitive.Root
            type="single"
            collapsible
            defaultValue={defaultValue}
            className="w-full space-y-3 sm:space-y-3.5"
          >
            {data.map((item, index) => (
              <AccordionPrimitive.Item
                key={`faq-${index}`}
                value={`item-${index}`}
                className={cn(
                  "group rounded-2xl bg-white transition-all duration-200 overflow-hidden",
                  // Closed state: clean, light border
                  "border border-slate-200/90 shadow-2xs hover:border-slate-300",
                  // Active/Open state: subtle, gentle emerald border & soft tint — NO dark outline
                  "data-[state=open]:border-emerald-300/80 data-[state=open]:bg-emerald-50/20 data-[state=open]:shadow-xs"
                )}
              >
                <AccordionPrimitive.Header className="flex m-0 p-0">
                  <AccordionPrimitive.Trigger
                    className="flex flex-1 items-start justify-between gap-4 p-5 sm:p-5.5 text-left cursor-pointer transition-colors group-hover:bg-slate-50/40 group-data-[state=open]:bg-transparent"
                  >
                    <span className="flex-1 font-bold text-[15px] sm:text-[17px] text-[#001e2b] group-hover:text-[#00684a] leading-snug transition-colors">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 select-none mt-0.5",
                        // Subtle button background & icon color transition
                        "bg-slate-100/90 text-slate-600 group-hover:bg-emerald-100/70 group-hover:text-[#00684a]",
                        "group-data-[state=open]:bg-emerald-100 group-data-[state=open]:text-[#00684a]"
                      )}
                      aria-hidden="true"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-data-[state=open]:rotate-45" />
                    </span>
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>

                <AccordionPrimitive.Content className="overflow-hidden text-sm sm:text-[15px] leading-relaxed text-[#5c6c7a] px-5 sm:px-5.5 pb-5 sm:pb-5.5 pt-0 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="text-[#425260] leading-relaxed border-t border-slate-100 pt-3">
                    {item.answer}
                  </div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
          </AccordionPrimitive.Root>
        </motion.div>
      </div>
    </section>
  );
}
