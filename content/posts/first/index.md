---
title: "PICOCTF-Forensics tour"
description: "The preparation for my self study math"
showSummary: true
summary: "testtererer"
weight: 2
draft: true
slug: "testURL"
tags: ["advanced", "css", "docs"]
series: ["Math Learning Journey"]
series_order: 1
---

## Riddle Registry
```
➜  Pico tshark -r myNetworkTraffic.pcap \
  -Y "tcp.len==12 || tcp.len==4" \
  -T fields \
  -e frame.time_epoch \
  -e tcp.segment_data \
| sort -n \
| cut -f2 \
| xxd -r -p
```