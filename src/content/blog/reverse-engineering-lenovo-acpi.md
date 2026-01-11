---
title: "Reverse Engineering Lenovo ACPI to gain back Fan Control"
description: "Explaining how i got fan control back on lenovo 14ASP10"
pubDate: 2026-01-11
author: "Orhan"
tags: ["lenovo", "reverse-engineering"]
---

## I USED AI.
As much as i like doing things manually, this was a HARD project to do. I had to use Claude Opus 4.5 to decode SSDT tables, extract their ACPI control registers, then make it analyze it again, and write a PoC.

Now i got the PoC code working with a PoC, i would like to write a kernel driver for it.

The acp driver for lenovo yoga laptops is `ideapad_module`, which handles legion, yoga, ideapad's etc. I mailed the original author of this module, and the current maintainer. I still got no response. will report back.
