import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { TorrentFile } from './torrent'
import { execSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let testDir: string
let targetDir: string
let linkDir: string

beforeAll(() => {
  // Create unique test directory for each test
  testDir = join(tmpdir(), `test-${Date.now()}-${Math.random().toString(36).substring(7)}`)

  targetDir = join(testDir, 'source')
  linkDir = join(testDir, 'link')

  mkdirSync(targetDir, { recursive: true })
  mkdirSync(linkDir, { recursive: true })

  // Create  target files
  writeFileSync(join(targetDir, 'file1'), '1')
  writeFileSync(join(targetDir, 'file2'), '12')
  writeFileSync(join(targetDir, 'file3'), '123')
  writeFileSync(join(targetDir, 'file4'), '1234')

  // Create hard linked copy
  execSync(`ln "${join(targetDir, 'file1')}" "${join(linkDir, 'file1a')}"`)
  execSync(`ln "${join(targetDir, 'file1')}" "${join(linkDir, 'file1b')}"`)

  execSync(`ln "${join(targetDir, 'file3')}" "${join(linkDir, 'file3a')}"`)
  execSync(`ln "${join(targetDir, 'file3')}" "${join(linkDir, 'file3b')}"`)
  execSync(`ln "${join(targetDir, 'file3')}" "${join(linkDir, 'file3c')}"`)
  execSync(`ln "${join(targetDir, 'file3')}" "${join(linkDir, 'file3d')}"`)

  execSync(`ln "${join(targetDir, 'file4')}" "${join(linkDir, 'file4a')}"`)
  execSync(`ln "${join(targetDir, 'file4')}" "${join(linkDir, 'file4b')}"`)
  execSync(`ln "${join(targetDir, 'file4')}" "${join(linkDir, 'file4c')}"`)

  // Remove file 4
  rmSync(join(targetDir, 'file4'))

  /*
  Links mapping:
    file1
    ├── file1a
    └── file1b
    file2
    └── (no links)
    file3
    ├── file3a
    ├── file3b
    ├── file3c
    └── file3d
    (deleted)
    ├── file4a
    ├── file4b
    └── file4c
  */

})

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true })
})

describe('Test isHardLinked()', () => {
  test('2 files are hard linked (from path)', async () => {
    const torrentFile = await TorrentFile.fromPath(join(targetDir, 'file1'))
    expect(await torrentFile.isHardLinkedWith(join(linkDir, 'file1a'))).toBe(true)
  })

  test('2 files are not hard linked (from BunFile)', async () => {
    const torrentFile = await TorrentFile.fromPath(join(targetDir, 'file1'))
    const comparaisonBunFile = await Bun.file(join(linkDir, 'file1a'))
    expect(await torrentFile.isHardLinkedWith(comparaisonBunFile)).toBe(true)
  })

  test('2 files are not hard linked', async () => {
    const torrentFile = await TorrentFile.fromPath(join(targetDir, 'file1'))
    expect(await torrentFile.isHardLinkedWith(join(linkDir, 'file3a'))).toBe(false)
  })

  test('1 file is invalid', async () => {
    const torrentFile = await TorrentFile.fromPath(join(targetDir, 'file1'))
    expect(torrentFile.isHardLinkedWith(join(linkDir, 'invalid'))).rejects.toThrow()
  })

})
