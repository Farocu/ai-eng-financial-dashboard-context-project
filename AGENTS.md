# Agent Guidance

Agents working on this project **must**:

- Look for **work instructions and rules** in the directory:  
  `./.agents/rules`

- Look for available **agent skills** in the directory:  
  `./.agents/skills`
- For project-local skills stored in `./.skills`, load the relevant `SKILL.md` before working in its domain. A skill may also be linked from `./.agents/skills` for agent discovery.

- Look for the **project memory bank** in:  
  `./memory-bank`  
  _(if the directory exists)_

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

name
grill-me
description
A relentless interview to sharpen a plan or design.
disable-model-invocation
true