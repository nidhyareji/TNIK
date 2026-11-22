// Project results transcribed from the source tables.
export const studyResults = {
  "docking": {
    "ponatinib": {
      "score": -11.139,
      "nearby": 15,
      "overlap": 10,
      "hydrogen": 0,
      "carbon": 31,
      "closest": 2.962
    },
    "tepotinib": {
      "score": -11.149,
      "nearby": 19,
      "overlap": 14,
      "hydrogen": 2,
      "carbon": 42,
      "closest": 2.811
    },
    "entrectinib": {
      "score": -10.736,
      "nearby": 18,
      "overlap": 12,
      "hydrogen": 1,
      "carbon": 40,
      "closest": 2.706
    },
    "nilotinib": {
      "score": -10.523,
      "nearby": 17,
      "overlap": 12,
      "hydrogen": 2,
      "carbon": 42,
      "closest": 2.959
    }
  },
  "redocking": {
    "pdb": "6RA7",
    "ligand": "JWK",
    "vina": "1.2.7",
    "score": -9.77,
    "atoms": 22,
    "rmsd": 0.782,
    "threshold": 2.0
  },
  "models": [
    {
      "name": "Random Forest",
      "cv": 0.5439,
      "cvStd": 0.0931,
      "r2": 0.4914,
      "rmse": 0.7976,
      "mae": 0.5917,
      "testCount": 91
    },
    {
      "name": "ChemBERTa",
      "cv": null,
      "cvStd": null,
      "r2": 0.0924,
      "rmse": 1.0656,
      "mae": 0.8626,
      "testCount": 91
    },
    {
      "name": "SVR",
      "cv": 0.4621,
      "cvStd": 0.0439,
      "r2": 0.3909,
      "rmse": 0.873,
      "mae": 0.6676,
      "testCount": 91
    },
    {
      "name": "Extra Trees",
      "cv": 0.3946,
      "cvStd": 0.1328,
      "r2": 0.4017,
      "rmse": 0.8652,
      "mae": 0.6233,
      "testCount": 91
    },
    {
      "name": "Gradient Boosting",
      "cv": 0.5012,
      "cvStd": 0.09,
      "r2": 0.4279,
      "rmse": 0.846,
      "mae": 0.636,
      "testCount": 91
    }
  ],
  "domain": {
    "threshold": 0.4,
    "inside": 86,
    "outside": 5,
    "insideMAE": 0.546615,
    "outsideMAE": 1.366396
  },
  "interactions": {
    "ponatinib": {
      "hydrogen": 1,
      "hydrophobic": 8,
      "halogen": 1,
      "salt": 0,
      "pose": "ponatinib_seed11",
      "hydrogenResidues": [
        "ASP171"
      ]
    },
    "tepotinib": {
      "hydrogen": 5,
      "hydrophobic": 14,
      "halogen": 0,
      "salt": 1,
      "pose": "tepotinib_seed22",
      "hydrogenResidues": [
        "GLY32",
        "LYS54",
        "GLU69",
        "CYS108",
        "ASP171"
      ]
    }
  },
  "screening": {
    "generated": 372,
    "similar": 105,
    "compliant": 98,
    "shortlisted": 22,
    "similarityThreshold": 0.4
  },
  "files": {
    "docking": "TNIK_final_structural_results_table.csv",
    "redocking": "TNIK_redocking_validation_summary.csv",
    "models": "Model_Comparison.xlsx",
    "interactions": "Interaction_Summary-v4.xlsx",
    "screening": "Analogue_generation_summary_5.xlsx"
  }
};
