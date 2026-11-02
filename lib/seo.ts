// Metadata and structured data, built the same way on every page.
import type { Metadata } from 'next';
import { absoluteUrl, dana, site } from './site';
import type { Article } from './articles';

export function meta({ title, description, path, image, type = 'website', noindex = false }: { title: string; description: string; path: string; image?: string; type?: 'website' | 'article'; noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, siteName: site.name, locale: site.locale, ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export const orgId = absoluteUrl('/#organization');
export const siteId = absoluteUrl('/#website');
export const danaId = absoluteUrl('/dana#dana');
export const appId = absoluteUrl('/#app');

export const organization = {
  '@type': 'Organization',
  '@id': orgId,
  name: site.name,
  alternateName: site.appName,
  url: site.url,
  logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.png'), width: 512, height: 512 },
  email: site.email,
  founder: { '@id': danaId },
  sameAs: [dana.socials[0].url],
};

export const person = {
  '@type': 'Person',
  '@id': danaId,
  name: dana.name.replace(/^Dr\.\s*/, ''),
  honorificPrefix: 'Dr.',
  honorificSuffix: dana.credential,
  jobTitle: 'Urologist',
  description: `${dana.role} at ${dana.practice} in ${dana.practiceCity}. Creator of ${site.appName}.`,
  image: absoluteUrl(dana.photo),
  url: absoluteUrl('/dana'),
  worksFor: { '@type': 'MedicalOrganization', name: dana.practice, url: 'https://middlesexhealth.org' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: dana.medicalSchool },
  hasCredential: [{ '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'Doctor of Osteopathic Medicine (DO)' }],
  knowsAbout: ['Urology', 'Pelvic floor muscle training', 'Urinary incontinence', 'Stress urinary incontinence', 'Overactive bladder', "Women's pelvic health"],
  sameAs: dana.socials.map((s) => s.url),
};

export const website = {
  '@type': 'WebSite',
  '@id': siteId,
  url: site.url,
  name: site.name,
  alternateName: site.appName,
  description: site.description,
  inLanguage: 'en-US',
  publisher: { '@id': orgId },
};

export const app = {
  '@type': 'MobileApplication',
  '@id': appId,
  name: site.appName,
  operatingSystem: 'iOS 17+, Android',
  applicationCategory: 'HealthApplication',
  description: 'Pelvic floor classes for women from a board-certified urologist: 6-week programs, one short lesson a week, one guided 5-minute exercise a day.',
  author: { '@id': danaId },
  publisher: { '@id': orgId },
  offers: [
    { '@type': 'Offer', price: site.price.weekly.replace('$', ''), priceCurrency: 'USD', name: 'Weekly plan' },
    { '@type': 'Offer', price: site.price.annual.replace('$', ''), priceCurrency: 'USD', name: 'Annual plan' },
  ],
  ...(site.appStoreUrl || site.playStoreUrl ? { downloadUrl: [site.appStoreUrl, site.playStoreUrl].filter(Boolean) } : {}),
};

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function articleLd(a: Article) {
  const url = absoluteUrl(`/letters/${a.slug}`);
  return [
    {
      '@type': ['BlogPosting', 'MedicalWebPage'],
      '@id': `${url}#article`,
      headline: a.title,
      alternativeHeadline: a.seoTitle,
      description: a.description,
      url,
      mainEntityOfPage: url,
      image: absoluteUrl(`/letters/${a.slug}/opengraph-image`),
      datePublished: a.date,
      dateModified: a.updated,
      lastReviewed: a.updated,
      inLanguage: 'en-US',
      wordCount: a.words,
      timeRequired: `PT${a.minutes}M`,
      keywords: a.keywords.join(', '),
      articleSection: a.topic,
      audience: { '@type': 'PeopleAudience', audienceType: 'Women', suggestedGender: 'female', suggestedMinAge: 16 },
      author: { '@id': danaId },
      reviewedBy: { '@id': danaId },
      publisher: { '@id': orgId },
      isPartOf: { '@id': siteId },
      citation: a.sources.map((s) => ({ '@type': 'CreativeWork', name: s.text, url: s.url })),
    },
    ...(a.faq.length
      ? [{ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: a.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }]
      : []),
    breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Letters', path: '/letters' }, { name: a.title, path: `/letters/${a.slug}` }]),
  ];
}

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes.flat() });
