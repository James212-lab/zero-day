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

export const modules: Module[] = [
  module01,
  module02,
  module03,
  module04,
  module05,
  module06,
  module07,
  module08,
  module09,
  module10,
  module11,
  module12,
  module13,
  module14,
  module15,
  module16,
  module17,
  module18,
  module19,
  module20,
];

export const phases = [
  {
    id: 1,
    title: "Fundamentals",
    subtitle: "Hardware, networking, OS and programming foundations",
    modules: [module01, module02, module03, module04],
  },
  {
    id: 2,
    title: "Core Security",
    subtitle: "Security principles, cryptography and access control",
    modules: [module05, module06, module07],
  },
  {
    id: 3,
    title: "Threats & Attacks",
    subtitle: "Malware, social engineering and offensive techniques",
    modules: [module08, module09, module10, module11],
  },
  {
    id: 4,
    title: "Defense & Monitoring",
    subtitle: "SIEM, incident response, forensics and vulnerability management",
    modules: [module12, module13, module14, module15],
  },
  {
    id: 5,
    title: "Governance",
    subtitle: "Policy, law, ethics and compliance frameworks",
    modules: [module16, module17],
  },
  {
    id: 6,
    title: "Advanced Engineering",
    subtitle: "Cloud, IoT/OT security and security architecture",
    modules: [module18, module19, module20],
  },
];