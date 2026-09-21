import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { EdicionSaludDelLodo } from "@/components/insights/EdicionSaludDelLodo";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { richTextClassName } from "@/components/ui/richTextClassName";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { obtenerPayload } from "@/lib/payload";

type Props = { params: Promise<{ slug: string }> };

async function obtenerEdicion(slug: string) {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
        collection: "newsletter-ediciones",
        where: {
            and: [
                { slug: { equals: slug } },
                { estadoEnvio: { equals: "enviada" } },
            ],
        },
        depth: 1,
        limit: 1,
    });
    return docs[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const edicion = await obtenerEdicion(slug);
    if (!edicion) return {};
    return {
        title: `${edicion.titulo} | Newsletter | aquabioprocess.cl`,
        description: edicion.preheader ?? edicion.asunto,
    };
}

export default async function NewsletterEdicionPage({ params }: Props) {
    const { slug } = await params;
    const edicion = await obtenerEdicion(slug);
    if (!edicion) notFound();

    // Edicion 01 tiene layout editorial propio (cercano al PDF del tio).
    if (slug === "salud-del-lodo") {
        return (
            <>
                <div className="border-b border-border bg-background">
                    <Container className="py-4">
                        <nav className="flex items-center gap-2 text-sm text-foreground/50">
                            <Link
                                href="/insights"
                                className="hover:text-foreground"
                            >
                                Insights
                            </Link>
                            <span aria-hidden>/</span>
                            <Link
                                href="/insights#newsletter"
                                className="hover:text-foreground"
                            >
                                Newsletter
                            </Link>
                            <span aria-hidden>/</span>
                            <span className="text-foreground/80">
                                {edicion.titulo}
                            </span>
                        </nav>
                    </Container>
                </div>
                <EdicionSaludDelLodo
                    numero={edicion.numero}
                    fechaEnvio={edicion.fechaEnvio}
                />
            </>
        );
    }

    return (
        <Section textura>
            <Container className="relative max-w-3xl">
                <nav className="mb-6 flex items-center gap-2 text-sm text-foreground/50">
                    <Link href="/insights" className="hover:text-foreground">
                        Insights
                    </Link>
                    <span aria-hidden>/</span>
                    <Link
                        href="/insights#newsletter"
                        className="hover:text-foreground"
                    >
                        Newsletter
                    </Link>
                    <span aria-hidden>/</span>
                    <span className="text-foreground/80">{edicion.titulo}</span>
                </nav>

                <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                    Newsletter · Edición {edicion.numero}
                </p>
                <Heading level={1} className="mt-3">
                    {edicion.titulo}
                </Heading>
                {edicion.preheader ? (
                    <Text tone="lead" className="mt-4">
                        {edicion.preheader}
                    </Text>
                ) : null}
                <div className={`mt-10 ${richTextClassName}`}>
                    <RichText data={edicion.contenido} />
                </div>
            </Container>
        </Section>
    );
}
