import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CampaignContributionStatus, CampaignStatus } from '@prisma/client';
import { compressToAvif } from '../../src/lib/imageCompress';
import MinioStorage from '../../src/lib/minio';
import AppConfig from '../../src/config/AppConfig';
import { MINIO_BUCKET } from '../../src/config/constants';
import prisma from '../../src/lib/prisma';
import type { CustomersResult } from './customers';

export interface CampaignRecord {
  id: string;
  name: string;
  costAmount: number;
}

export interface CampaignsResult {
  spayAndNeuterDrive: CampaignRecord;
  vaccinationFund: CampaignRecord;
  shelterRenovation: CampaignRecord;
  winterCarePackage: CampaignRecord;
  emergencyReliefFund: CampaignRecord;
}

const MEDIA_DIR = path.join(__dirname, '../media_seed');

async function uploadCampaignImage(campaignId: string, filename: string): Promise<string> {
  const config = AppConfig.getInstance();
  const storage = MinioStorage.getInstance();
  const raw = fs.readFileSync(path.join(MEDIA_DIR, filename));
  const compressed = await compressToAvif(raw);
  const key = `campaigns/${campaignId}/${crypto.randomUUID()}.avif`;
  await storage.putObject(MINIO_BUCKET, key, compressed, 'image/avif');
  return `${config.imageBaseUrl}/${key}`;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function seedCampaigns(customers: CustomersResult): Promise<CampaignsResult> {
  // ── Spay & Neuter Drive — ACTIVE, runs forever ────────────────────────────
  const spayAndNeuterDrive = await prisma.campaign.create({
    data: {
      name: 'Spay & Neuter Drive',
      description:
        'Help us fund spay and neuter surgeries for stray dogs across Bangalore. Every contribution directly sponsors a procedure.',
      costAmount: 50000,
      startDate: daysFromNow(-7),
      endDate: null,
      status: CampaignStatus.ACTIVE,
    },
  });
  const spayUrl = await uploadCampaignImage(spayAndNeuterDrive.id, 'woof2.jpeg');
  await prisma.campaign.update({ where: { id: spayAndNeuterDrive.id }, data: { imageUrl: spayUrl } });

  // ── Vaccination Fund — ACTIVE, ends in 30 days ───────────────────────────
  const vaccinationFund = await prisma.campaign.create({
    data: {
      name: 'Vaccination Fund',
      description:
        'Support our annual vaccination drive — rabies, distemper, and parvovirus shots for dogs in shelters.',
      costAmount: 25000,
      startDate: daysFromNow(-30),
      endDate: daysFromNow(30),
      status: CampaignStatus.ACTIVE,
    },
  });
  const vaccinationUrl = await uploadCampaignImage(vaccinationFund.id, 'woof3.jpeg');
  await prisma.campaign.update({ where: { id: vaccinationFund.id }, data: { imageUrl: vaccinationUrl } });

  // ── Shelter Renovation 2025 — COMPLETED ──────────────────────────────────
  const shelterRenovation = await prisma.campaign.create({
    data: {
      name: 'Shelter Renovation 2025',
      description:
        'We successfully renovated the main Bangalore shelter — new kennels, clean water systems, and weatherproof roofing. Thank you!',
      costAmount: 100000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      status: CampaignStatus.COMPLETED,
    },
  });
  const shelterUrl = await uploadCampaignImage(shelterRenovation.id, 'woof4.jpeg');
  await prisma.campaign.update({ where: { id: shelterRenovation.id }, data: { imageUrl: shelterUrl } });

  // ── Winter Care Package — DRAFT, not yet launched ─────────────────────────
  const winterCarePackage = await prisma.campaign.create({
    data: {
      name: 'Winter Care Package',
      description:
        'Preparing warm bedding and nutrition packages for street dogs ahead of the winter months. Campaign launching soon.',
      costAmount: 15000,
      startDate: daysFromNow(1),
      endDate: daysFromNow(60),
      status: CampaignStatus.DRAFT,
    },
  });

  // ── Emergency Relief Fund — INACTIVE, deactivated mid-run ─────────────────
  const emergencyReliefFund = await prisma.campaign.create({
    data: {
      name: 'Emergency Relief Fund',
      description:
        'A general emergency fund for urgent veterinary care for injured strays. Currently paused for review.',
      costAmount: 75000,
      startDate: new Date('2025-06-01'),
      endDate: null,
      status: CampaignStatus.INACTIVE,
    },
  });

  console.log('  Created 5 campaigns (2 ACTIVE, 1 COMPLETED, 1 DRAFT, 1 INACTIVE) with images for 3.');

  // ── Contributions ─────────────────────────────────────────────────────────
  // Spay & Neuter Drive: arjun ×2, priya ×1, rahul ×2
  // Vaccination Fund:    arjun ×1, priya ×2, vikram ×1
  // Shelter Renovation:  rahul ×2, priya ×1, arjun ×1, anjali ×1 FAILED
  // Emergency Relief:    rahul ×1, priya ×1, sneha ×1 FAILED
  // Winter Care Package: 0 (DRAFT — not launched)

  const contributions = await prisma.$transaction([
    // Spay & Neuter Drive (5)
    prisma.campaignContribution.create({
      data: { campaignId: spayAndNeuterDrive.id, customerId: customers.arjun.id, amount: 50000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: spayAndNeuterDrive.id, customerId: customers.arjun.id, amount: 50000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: spayAndNeuterDrive.id, customerId: customers.priya.id, amount: 50000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: spayAndNeuterDrive.id, customerId: customers.rahul.id, amount: 50000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: spayAndNeuterDrive.id, customerId: customers.rahul.id, amount: 50000, status: CampaignContributionStatus.SUCCESS },
    }),
    // Vaccination Fund (4)
    prisma.campaignContribution.create({
      data: { campaignId: vaccinationFund.id, customerId: customers.arjun.id, amount: 25000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: vaccinationFund.id, customerId: customers.priya.id, amount: 25000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: vaccinationFund.id, customerId: customers.priya.id, amount: 25000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: vaccinationFund.id, customerId: customers.vikram.id, amount: 25000, status: CampaignContributionStatus.SUCCESS },
    }),
    // Shelter Renovation 2025 (5)
    prisma.campaignContribution.create({
      data: { campaignId: shelterRenovation.id, customerId: customers.rahul.id, amount: 100000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: shelterRenovation.id, customerId: customers.rahul.id, amount: 100000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: shelterRenovation.id, customerId: customers.priya.id, amount: 100000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: shelterRenovation.id, customerId: customers.arjun.id, amount: 100000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: shelterRenovation.id, customerId: customers.anjali.id, amount: 100000, status: CampaignContributionStatus.FAILED },
    }),
    // Emergency Relief Fund (3)
    prisma.campaignContribution.create({
      data: { campaignId: emergencyReliefFund.id, customerId: customers.rahul.id, amount: 75000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: emergencyReliefFund.id, customerId: customers.priya.id, amount: 75000, status: CampaignContributionStatus.SUCCESS },
    }),
    prisma.campaignContribution.create({
      data: { campaignId: emergencyReliefFund.id, customerId: customers.sneha.id, amount: 75000, status: CampaignContributionStatus.FAILED },
    }),
  ]);

  console.log(`  Created ${contributions.length} contributions across 4 campaigns (2 FAILED status included).`);
  console.log('  "Winter Care Package" (DRAFT) seeded with 0 contributions.');

  return {
    spayAndNeuterDrive: { id: spayAndNeuterDrive.id, name: spayAndNeuterDrive.name, costAmount: spayAndNeuterDrive.costAmount },
    vaccinationFund: { id: vaccinationFund.id, name: vaccinationFund.name, costAmount: vaccinationFund.costAmount },
    shelterRenovation: { id: shelterRenovation.id, name: shelterRenovation.name, costAmount: shelterRenovation.costAmount },
    winterCarePackage: { id: winterCarePackage.id, name: winterCarePackage.name, costAmount: winterCarePackage.costAmount },
    emergencyReliefFund: { id: emergencyReliefFund.id, name: emergencyReliefFund.name, costAmount: emergencyReliefFund.costAmount },
  };
}
