// Chemical descriptors transcribed from the individual PubChem Compound records.
// Project script literals are provisional until checked against the original outputs.
const pubchem = cid => `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
const dailyMed = id => `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${id}`;

export const target = {
  symbol: 'TNIK', name: 'TRAF2 and NCK-interacting protein kinase', organism: 'Homo sapiens',
  uniprot: 'Q9UKE5', chembl: 'CHEMBL4527', length: 1360,
  description: 'A human serine/threonine kinase implicated in Wnt signaling. Published work on rentosertib provides a reason to study TNIK in pulmonary fibrosis.',
  source: { label: 'UniProtKB · Q9UKE5', url: 'https://www.uniprot.org/uniprotkb/Q9UKE5/entry' },
  sequence: 'https://rest.uniprot.org/uniprotkb/Q9UKE5.fasta',
  activities: 'https://www.ebi.ac.uk/chembl/explore/target/CHEMBL4527',
  structure: {
    id: '6RA7', ligand: 'JWK', chain: 'A', resolution: 1.20, method: 'X-ray diffraction',
    label: 'Human TNIK in complex with compound 9',
    url: 'https://www.rcsb.org/structure/6RA7',
    viewer: 'https://www.rcsb.org/3d-view/6RA7',
    download: 'https://files.rcsb.org/download/6RA7.pdb',
    pocket: 'https://www.rcsb.org/ligand-validation/6RA7/JWK'
  },
  redocking: {
    rmsdAngstrom: 0.782, thresholdAngstrom: 2.0, heavyAtoms: 22, vinaScore: -9.770,
    status: 'Provisional · embedded in supplied script', source: 'TNIK_redocking_validation_summary.py'
  }
};

const candidateRecords = [
  {
    id: 'tepotinib', name: 'Tepotinib', cid: 25171648, projectId: 2015, chemblId: 'CHEMBL3402762',
    synonyms: ['EMD-1214063', 'EMD1214063', 'Tepmetko', '1100598-32-0'],
    formula: 'C29H28N6O2', weight: 492.6, inchiKey: 'AHYMHWXQRWRBKT-UHFFFAOYSA-N',
    smiles: 'CN1CCC(CC1)COC2=CN=C(N=C2)C3=CC=CC(=C3)CN4C(=O)C=CC(=N4)C5=CC=CC(=C5)C#N',
    inchi: 'InChI=1S/C29H28N6O2/c1-34-12-10-21(11-13-34)20-37-26-17-31-29(32-18-26)25-7-3-5-23(15-25)19-35-28(36)9-8-27(33-35)24-6-2-4-22(14-24)16-30/h2-9,14-15,17-18,21H,10-13,19-20H2,1H3',
    iupac: '3-[1-[[3-[5-[(1-methylpiperidin-4-yl)methoxy]pyrimidin-2-yl]phenyl]methyl]-6-oxopyridazin-3-yl]benzonitrile',
    properties: { xlogp: 3.4, donors: 0, acceptors: 7, tpsa: 94.7, rotatableBonds: 7, charge: 0 },
    target: 'MET', description: 'MET kinase inhibitor and a computational follow-up candidate in the original TNIK study.',
    use: 'U.S. oncology indication for certain MET exon 14 skipping non-small cell lung cancers.',
    safety: 'The label identifies interstitial lung disease or pneumonitis and hepatotoxicity as risks.',
    adme: 'The U.S. label reports approximately 98% plasma protein binding and a 32-hour half-life in patients with cancer.',
    labelId: '80a0f1b9-071a-47f5-9e67-32d638a669dc',
    overlap: { nearest: 0.299, pairs2: 72, pairs3: 145, residues: 14 },
    observations: [
      { label: 'Computational follow-up candidate', detail: 'The workflow summary prioritizes tepotinib for follow-up based on the combined docking and structural observations. It describes a geometrically plausible contact involving a binding-site cysteine.', source: 'TNIK–IPF project workflow · pp. 4–5' },
      { label: 'Preliminary restrained simulation', detail: 'A supplied figure script contains an RMSD summary for the modeled tepotinib +1 system. Original trajectories and analysis outputs were unavailable for verification.', source: 'generate_MD_figures.py' }
    ]
  },
  {
    id: 'ponatinib', name: 'Ponatinib', cid: 24826799, projectId: 1593, chemblId: 'CHEMBL1171837',
    synonyms: ['AP24534', 'AP-24534', 'Iclusig', '943319-70-8'],
    formula: 'C29H27F3N6O', weight: 532.6, inchiKey: 'PHXJVRSECIGDHY-UHFFFAOYSA-N',
    smiles: 'CC1=C(C=C(C=C1)C(=O)NC2=CC(=C(C=C2)CN3CCN(CC3)C)C(F)(F)F)C#CC4=CN=C5N4N=CC=C5',
    inchi: 'InChI=1S/C29H27F3N6O/c1-20-5-6-22(16-21(20)8-10-25-18-33-27-4-3-11-34-38(25)27)28(39)35-24-9-7-23(26(17-24)29(30,31)32)19-37-14-12-36(2)13-15-37/h3-7,9,11,16-18H,12-15,19H2,1-2H3,(H,35,39)',
    iupac: '3-(2-imidazo[1,2-b]pyridazin-3-ylethynyl)-4-methyl-N-[4-[(4-methylpiperazin-1-yl)methyl]-3-(trifluoromethyl)phenyl]benzamide',
    properties: { xlogp: 4.1, donors: 1, acceptors: 8, tpsa: 65.8, rotatableBonds: 6, charge: 0 },
    target: 'BCR::ABL1 and other kinases', description: 'Multikinase inhibitor included in the original four-compound structural comparison.',
    use: 'U.S. oncology indications for selected Philadelphia chromosome-positive leukemias.',
    safety: 'The label carries boxed warnings for arterial occlusive events, venous thromboembolism, heart failure, and hepatotoxicity.',
    adme: 'The U.S. label reports greater than 99% plasma protein binding in vitro and a mean terminal half-life of about 24 hours in the reported oncology setting.',
    labelId: '16d804b6-4957-43ee-b18c-3b36ec37c5ac',
    overlap: { nearest: 0.402, pairs2: 60, pairs3: 130, residues: 10 },
    observations: [
      { label: 'Preliminary restrained simulations', detail: 'The supplied figure script lists N32-H and N37-H ponatinib systems. The original run parameters and trajectories are required to confirm duration and interpret the summaries.', source: 'generate_MD_figures.py' },
      { label: 'Proteomics observation pending review', detail: 'The project audit mentions a cell-lysate Kinobeads observation and calls for source and assay verification. It is excluded from measured TNIK inhibition evidence.', source: 'create_publication_readiness_audit.py' }
    ]
  },
  {
    id: 'entrectinib', name: 'Entrectinib', cid: 25141092, projectId: 1969, chemblId: 'CHEMBL1983268',
    synonyms: ['RXDX-101', 'NMS-E628', 'Rozlytrek', '1108743-60-7'],
    formula: 'C31H34F2N6O2', weight: 560.6, inchiKey: 'HAYYBYPASCDWEQ-UHFFFAOYSA-N',
    smiles: 'CN1CCN(CC1)C2=CC(=C(C=C2)C(=O)NC3=NNC4=C3C=C(C=C4)CC5=CC(=CC(=C5)F)F)NC6CCOCC6',
    inchi: 'InChI=1S/C31H34F2N6O2/c1-38-8-10-39(11-9-38)25-3-4-26(29(19-25)34-24-6-12-41-13-7-24)31(40)35-30-27-17-20(2-5-28(27)36-37-30)14-21-15-22(32)18-23(33)16-21/h2-5,15-19,24,34H,6-14H2,1H3,(H2,35,36,37,40)',
    iupac: 'N-[5-[(3,5-difluorophenyl)methyl]-1H-indazol-3-yl]-4-(4-methylpiperazin-1-yl)-2-(oxan-4-ylamino)benzamide',
    properties: { xlogp: 5.7, donors: 3, acceptors: 8, tpsa: 85.5, rotatableBonds: 7, charge: 0 },
    target: 'TRK, ROS1, and ALK', description: 'Kinase inhibitor included in the original four-compound structural comparison.',
    use: 'U.S. oncology indications include selected ROS1-positive lung cancers and NTRK fusion-positive solid tumors.',
    safety: 'The label identifies congestive heart failure, central nervous system effects, hepatotoxicity, and QT interval prolongation among its risks.',
    adme: 'The U.S. label estimates a 20-hour half-life for entrectinib and a 40-hour half-life for its active M5 metabolite.',
    labelId: 'c7c71b0c-2549-4495-86b6-c2807fa54908',
    overlap: { nearest: 0.403, pairs2: 64, pairs3: 134, residues: 12 }, observations: []
  },
  {
    id: 'nilotinib', name: 'Nilotinib', cid: 644241, projectId: 1310, chemblId: 'CHEMBL255863',
    synonyms: ['AMN 107', 'AMN-107', 'Tasigna', '641571-10-0'],
    formula: 'C28H22F3N7O', weight: 529.5, inchiKey: 'HHZIURLSWUIHRB-UHFFFAOYSA-N',
    smiles: 'CC1=C(C=C(C=C1)C(=O)NC2=CC(=CC(=C2)C(F)(F)F)N3C=C(N=C3)C)NC4=NC=CC(=N4)C5=CN=CC=C5',
    inchi: 'InChI=1S/C28H22F3N7O/c1-17-5-6-19(10-25(17)37-27-33-9-7-24(36-27)20-4-3-8-32-14-20)26(39)35-22-11-21(28(29,30)31)12-23(13-22)38-15-18(2)34-16-38/h3-16H,1-2H3,(H,35,39)(H,33,36,37)',
    iupac: '4-methyl-N-[3-(4-methylimidazol-1-yl)-5-(trifluoromethyl)phenyl]-3-[(4-pyridin-3-ylpyrimidin-2-yl)amino]benzamide',
    properties: { xlogp: 4.9, donors: 2, acceptors: 9, tpsa: 97.6, rotatableBonds: 6, charge: 0 },
    target: 'BCR::ABL1 and other kinases', description: 'Kinase inhibitor included in the original structural comparison with published preclinical pulmonary fibrosis data.',
    use: 'U.S. oncology indications for selected Philadelphia chromosome-positive chronic myeloid leukemia populations.',
    safety: 'The label carries a boxed warning for QT prolongation and sudden deaths.',
    adme: 'The U.S. label estimates a mean apparent elimination half-life of about 17 hours and reports about 98% serum protein binding.',
    labelId: '6093952a-5248-45cb-ad17-33716a411146',
    overlap: { nearest: 0.415, pairs2: 60, pairs3: 131, residues: 12 }, observations: []
  }
];

export const candidates = candidateRecords.map(({labelId, ...compound}) => ({
  ...compound, project: true, propertyType: 'Computed by PubChem',
  source: { label: `PubChem · CID ${compound.cid}`, url: pubchem(compound.cid) },
  labelSource: { label: 'DailyMed · U.S. prescribing information', url: dailyMed(labelId) },
  image: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compound.cid}/PNG?image_size=large`,
  structure3d: `https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}#section=3D-Conformer`,
  observations: [
    { label: 'Docked pose overlap with JWK', detail: `${compound.overlap.residues} shared pocket residues in the supplied script. This is a provisional geometric comparison with the crystallographic reference ligand.`, source: 'TNIK_create_master_comparison.py' },
    ...compound.observations
  ]
}));

export const publications = [
  {
    id: 'rentosertib-phase2a', title: 'A generative AI-discovered TNIK inhibitor for idiopathic pulmonary fibrosis: a randomized phase 2a trial',
    authors: 'Xu Z, Ren F, Wang P, et al.', year: 2025, journal: 'Nature Medicine',
    doi: '10.1038/s41591-025-03743-2', url: 'https://www.nature.com/articles/s41591-025-03743-2',
    type: 'Clinical trial', category: 'TNIK and IPF', compounds: ['rentosertib'],
    summary: 'A randomized, placebo-controlled phase 2a trial examined 12 weeks of rentosertib in 71 people with IPF. The primary endpoint was safety, and forced vital capacity was a secondary endpoint.',
    limitation: 'This trial provides target–disease context for a separate investigational compound. The study was small and short.'
  },
  {
    id: 'rentosertib-discovery', title: 'A small-molecule TNIK inhibitor targets fibrosis in preclinical and clinical models',
    authors: 'Ren F, Aliper A, Chen J, et al.', year: 2025, journal: 'Nature Biotechnology',
    doi: '10.1038/s41587-024-02143-0', url: 'https://www.nature.com/articles/s41587-024-02143-0',
    type: 'Original research', category: 'TNIK and IPF', compounds: ['rentosertib'],
    summary: 'The investigators developed INS018_055 (rentosertib), evaluated it in preclinical fibrosis models, and reported early clinical pharmacokinetics and safety.',
    limitation: 'The data relate to rentosertib and the specific models, assays, and participants studied.'
  },
  {
    id: 'nilotinib-fibrosis', title: 'Effect of nilotinib on bleomycin-induced acute lung injury and pulmonary fibrosis in mice',
    authors: 'Rhee CK, Lee SH, Yoon HK, et al.', year: 2011, journal: 'Respiration',
    doi: '10.1159/000327719', url: 'https://pubmed.ncbi.nlm.nih.gov/21659722/',
    type: 'Original research', category: 'Pulmonary fibrosis models', compounds: ['nilotinib'],
    summary: 'In a bleomycin mouse model, the authors reported lower lung hydroxyproline and attenuated fibrosis with nilotinib. They also reported reduced PDGF-driven lung fibroblast proliferation in vitro.',
    limitation: 'TNIK mediation and efficacy in human IPF remain unestablished by this study.'
  },
  {
    id: 'kinobeads', title: 'The target landscape of clinical kinase drugs',
    authors: 'Klaeger S, Heinzlmeir S, Wilhelm M, et al.', year: 2017, journal: 'Science',
    doi: '10.1126/science.aan4368', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6542668/',
    type: 'Original research', category: 'Kinase profiling', compounds: ['ponatinib'],
    summary: 'A Kinobeads chemical proteomics study profiled the target landscape and selectivity of clinical kinase inhibitors.',
    limitation: 'A lysate competition readout and a purified target catalytic assay answer different questions.'
  }
];

export const modelMetrics = [
  { label: 'Held-out R²', value: 0.4914, source: 'train_tnik_additional_models.py', status: 'Provisional' },
  { label: 'Held-out RMSE (pIC₅₀)', value: 0.7976, source: 'train_tnik_additional_models.py', status: 'Provisional' },
  { label: 'Held-out MAE (pIC₅₀)', value: 0.5917, source: 'train_tnik_additional_models.py', status: 'Provisional' }
];

export const simulation = {
  label: 'Preliminary restrained simulations', status: 'Provisional · embedded in supplied plotting script',
  source: 'generate_MD_figures.py',
  summary: 'The script stores means and standard deviations for three modeled systems. Raw trajectories, run duration, and final analysis files were unavailable.',
  systems: [
    { label: 'Ponatinib N32-H', backboneRmsdNm: 0.021963781, ligandRmsdNm: 0.031710042, contactMean: 31.198020 },
    { label: 'Ponatinib N37-H', backboneRmsdNm: 0.022270339, ligandRmsdNm: 0.029538217, contactMean: 32.009901 },
    { label: 'Tepotinib +1', backboneRmsdNm: 0.021968940, ligandRmsdNm: 0.029146428, contactMean: 33.376238 }
  ]
};

export const sources = [
  { label: 'PubChem', url: 'https://pubchem.ncbi.nlm.nih.gov/', role: 'Chemical identity and computed properties' },
  { label: 'ChEMBL', url: target.activities, role: 'Curated human TNIK bioactivity records' },
  { label: 'UniProt', url: target.source.url, role: 'Reviewed protein annotation and sequence' },
  { label: 'RCSB PDB', url: target.structure.url, role: 'Experimental TNIK–JWK reference structure' },
  { label: 'Europe PMC', url: 'https://europepmc.org/', role: 'Literature search' },
  { label: 'DailyMed', url: 'https://dailymed.nlm.nih.gov/', role: 'U.S. prescribing information' },
  { label: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov/study/NCT05938920', role: 'Registry record for the rentosertib phase 2a trial' }
];

const activitySource = { label: 'ChEMBL · human TNIK bioactivity', url: target.activities };
const projectSource = { label: 'Original TNIK Insight research dataset' };
const nilotinibStudy = publications.find(paper => paper.id === 'nilotinib-fibrosis');
const nilotinibSource = { label: 'Rhee et al. · Respiration (2011)', url: nilotinibStudy.url };

const row = (key, label, status, detail, source) => ({key, label, status, detail, source});

function assayEvidence(bioactivity, context, fields, extraContext = '') {
  const {key, label, countNoun} = fields;
  const matches = (bioactivity.records || []).filter(record => record.endpointContext === context);
  if (matches.length) {
    const count = matches.length;
    return row(key, label, 'partial',
      `${count} possible ${count === 1 ? 'record' : 'records'} in the retrieved ChEMBL results. Review each ${countNoun} and its original assay before making a claim.`,
      {label: 'ChEMBL · assay record', url: matches[0].url || bioactivity.sourceUrl || activitySource.url});
  }
  if (extraContext) return row(key, label, 'partial', extraContext, projectSource);
  if (bioactivity.status === 'empty') {
    return row(key, label, 'missing', 'No matching activity record was identified in this ChEMBL lookup. Other sources or assay formats may contain evidence.', activitySource);
  }
  if (bioactivity.status === 'found') {
    return row(key, label, 'not_assessed', 'Activity records were returned. Their descriptions do not establish this evidence category automatically.', activitySource);
  }
  return row(key, label, 'not_assessed', 'No compound-specific assay assessment is available in the current view.', activitySource);
}

export function evidenceFor(compound, lookup = {}) {
  const bioactivity = lookup.bioactivity || {};
  const binding = assayEvidence(
    bioactivity, 'Binding endpoint', {key: 'binding', label: 'Measured TNIK binding', countNoun: 'binding endpoint'},
    compound.id === 'ponatinib' ? 'The project audit flags an apparent cell-lysate binding observation for manual provenance review.' : ''
  );
  const inhibition = assayEvidence(
    bioactivity, 'Possible functional assay', {key: 'inhibition', label: 'Functional TNIK inhibition', countNoun: 'assay endpoint'}
  );
  const nilotinib = Number(compound.cid) === 644241 || compound.id === 'nilotinib';
  const labelSource = compound.labelSource || null;

  return [
    row('computational', 'Computational TNIK interaction', compound.project ? 'partial' : 'not_assessed',
      compound.project ? 'Included in the original docking and structural comparison. The pose is a computational hypothesis.' : 'Original project evidence covers the four supplied candidates.',
      compound.project ? projectSource : null),
    binding,
    inhibition,
    row('cellular', 'Pulmonary fibroblast evidence', nilotinib ? 'supported' : 'not_assessed',
      nilotinib ? 'One study reported reduced PDGF-stimulated lung fibroblast proliferation in vitro.' : 'A compound-specific cellular finding requires manual source review.',
      nilotinib ? nilotinibSource : null),
    row('antifibrotic', 'Pulmonary fibrosis model', nilotinib ? 'supported' : 'not_assessed',
      nilotinib ? 'One bleomycin mouse study reported attenuated lung fibrosis and lower hydroxyproline.' : 'A compound-specific pulmonary fibrosis model finding requires manual source review.',
      nilotinib ? nilotinibSource : null),
    row('mechanism', 'TNIK-dependent antifibrotic effect', 'not_assessed',
      nilotinib ? 'The curated fibrosis study establishes effects in its models. It leaves their TNIK dependence unresolved.' : 'A TNIK-specific mechanism would require direct mechanistic evidence.',
      nilotinib ? nilotinibSource : null),
    row('safety', 'Safety and tolerability evidence', labelSource ? 'partial' : 'not_assessed',
      compound.safety || 'No compound-specific safety assessment in the current view.', labelSource),
    row('adme', 'ADME and pharmacokinetics', labelSource ? 'partial' : 'not_assessed',
      compound.adme || 'No compound-specific pharmacokinetic assessment in the current view.', labelSource)
  ];
}

export function nextStepFor(compound, rows = evidenceFor(compound)) {
  const inhibition = rows.find(entry => entry.key === 'inhibition');
  if (inhibition?.status === 'partial') {
    return {title: 'Review the TNIK assay records', detail: 'Check the target identity, assay format, readout, units, and original source before assigning the compound a functional inhibition status.'};
  }
  if (compound.project) {
    return {title: 'Verify direct TNIK inhibition', detail: 'Establish a functional TNIK readout and selectivity before assigning the compound a TNIK-based antifibrotic mechanism.'};
  }
  return {title: 'Establish compound-specific evidence', detail: 'Review identity-matched TNIK bioactivity records and pulmonary fibrosis studies before choosing a validation step.'};
}
