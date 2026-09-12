export type Level = "beginner" | "intermediate" | "advanced";

export interface Lesson {
  id: number;
  slug: string;
  title: string;
  level: Level;
  tag: string;
  duration: string;
  description: string;
  content: string;
  defaultCode: string;
  solution: string;
  hint: string;
  challenge: string;
}

export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  lessons: Lesson[];
}

import { module01 } from "./modules/module-01";
import { module02 } from "./modules/module-02";
import { module03 } from "./modules/module-03";
import { module04 } from "./modules/module-04";
import { module05 } from "./modules/module-05";
import { module06 } from "./modules/module-06";
import { module07 } from "./modules/module-07";
import { module08 } from "./modules/module-08";
import { module09 } from "./modules/module-09";
import { module10 } from "./modules/module-10";
import { module11 } from "./modules/module-11";
import { module12 } from "./modules/module-12";
import { module13 } from "./modules/module-13";
import { module14 } from "./modules/module-14";
import { module15 } from "./modules/module-15";
import { module16 } from "./modules/module-16";
import { module17 } from "./modules/module-17";
import { module18 } from "./modules/module-18";
import { module19 } from "./modules/module-19";
import { module20 } from "./modules/module-20";
import { module21 } from "./modules/module-21";
import { module22 } from "./modules/module-22";
import { module23 } from "./modules/module-23";
import { module24 } from "./modules/module-24";
import { module25 } from "./modules/module-25";
import { module26 } from "./modules/module-26";
import { module27 } from "./modules/module-27";
import { module28 } from "./modules/module-28";
import { module29 } from "./modules/module-29";
import { module30 } from "./modules/module-30";
import { module31 } from "./modules/module-31";
import { module32 } from "./modules/module-32";
import { module33 } from "./modules/module-33";
import { module34 } from "./modules/module-34";
import { module35 } from "./modules/module-35";
import { module36 } from "./modules/module-36";
import { module37 } from "./modules/module-37";
import { module38 } from "./modules/module-38";
import { module39 } from "./modules/module-39";
import { module40 } from "./modules/module-40";

export const modules: Module[] = [
  module01,
  module02,
  module03,
  module04,
  module05,
  module21,
  module06,
  module07,
  module08,
  module22,
  module23,
  module24,
  module25,
  module26,
  module27,
  module28,
  module29,
  module30,
  module31,
  module09,
  module10,
  module11,
  module18,
  module19,
  module32,
  module33,
  module12,
  module13,
  module14,
  module15,
  module34,
  module35,
  module36,
  module16,
  module17,
  module37,
  module20,
  module38,
  module39,
  module40,
];

export const phases = [
  {
    id: 1,
    title: "Foundations",
    subtitle: "Hardware, networking, OS, programming and cybersecurity foundations",
    modules: [module01, module02, module03, module04, module05, module21],
  },
  {
    id: 2,
    title: "Core Security",
    subtitle: "Security principles, cryptography, access control, secure architecture and SDLC",
    modules: [module06, module07, module08, module22, module23],
  },
  {
    id: 3,
    title: "Threats & Attacks",
    subtitle: "Ethical hacking, Kali toolkit, reconnaissance, exploitation and attacks",
    modules: [module24, module25, module26, module27, module28, module29, module30, module31, module09, module10, module11],
  },
  {
    id: 4,
    title: "Cloud, DevSecOps & Cryptanalysis",
    subtitle: "Cloud security, IoT/OT, denial-of-service and cryptanalysis",
    modules: [module18, module19, module32, module33],
  },
  {
    id: 5,
    title: "Defense, Detection & Response",
    subtitle: "SIEM, IR, forensics, vuln management, threat intel, EDR/XDR and network defense",
    modules: [module12, module13, module14, module15, module34, module35, module36],
  },
  {
    id: 6,
    title: "Governance & Risk",
    subtitle: "Policy, law, ethics, compliance and risk management",
    modules: [module16, module17, module37],
  },
  {
    id: 7,
    title: "Advanced",
    subtitle: "Security architecture, red team, reverse engineering and emerging threats",
    modules: [module20, module38, module39, module40],
  },
];