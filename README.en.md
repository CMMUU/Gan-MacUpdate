# UpdateMate

[中文](./README.md)

> Your Mac. Your choice.
>
> A one-click macOS update blocking tool based on `hosts`.

## What is this?

UpdateMate is a small utility that uses `hosts` rules to block macOS update-related requests with one click, helping reduce update prompts and interruptions.

No long product philosophy.
No dramatic backstory.

Just this:

**one click, less update noise.**

## Features

- one-click hosts rule setup
- one-click restore
- reduces update-related interruptions
- useful when you want your current setup left alone for a while

## Repository structure

- `src/` + `src-tauri/`: current desktop prototype
- `noupdate-server/`: related server-side experiment code
- `deploy/`: deployment samples
- `docs/`: supporting documents

## Usage notes

This repository is mainly for development and prototype work.

If you just want to understand the project, start with:

1. this `README.en.md`
2. `src/` and `src-tauri/`

## Disclaimer

This project is intended for local system configuration management and research use. Please make sure you understand what it changes before using it.

Before using any hosts-based blocking approach, you should know:

- what domains are being blocked
- how to restore the default state
- what side effects this may cause

## License

Add license information here before public release.
