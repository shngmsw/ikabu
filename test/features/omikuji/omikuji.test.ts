import { readFileSync, statSync } from 'node:fs';

import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fortunes } from '@/features/omikuji/fortunes';
import { handleOmikuji } from '@/features/omikuji/omikuji';
import { omikujiCommand } from '@/features/omikuji/omikuji_command';

const { warn } = vi.hoisted(() => ({ warn: vi.fn() }));
vi.mock('@/infra/logging/log4js', () => ({ log4js_obj: { getLogger: () => ({ warn }) } }));

function interaction() {
    return {
        deferReply: vi.fn().mockResolvedValue(undefined),
        editReply: vi.fn().mockResolvedValue(undefined),
    };
}
function execute(i: ReturnType<typeof interaction>) {
    return handleOmikuji(i as unknown as ChatInputCommandInteraction);
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
});
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

describe('おみくじ', () => {
    it('GIF の送信完了から3秒待ち、元の添付を除去して結果を表示する', async () => {
        const i = interaction();
        let finishUpload!: () => void;
        i.editReply.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    finishUpload = resolve;
                }),
        );
        const run = execute(i);
        await vi.advanceTimersByTimeAsync(5000);
        expect(i.deferReply).toHaveBeenCalledOnce();
        expect(i.editReply).toHaveBeenCalledOnce();
        expect(i.deferReply.mock.invocationCallOrder[0]).toBeLessThan(
            i.editReply.mock.invocationCallOrder[0],
        );
        const drawing = i.editReply.mock.calls[0][0];
        expect(drawing.files[0]).toBeInstanceOf(AttachmentBuilder);
        expect(drawing.embeds[0].toJSON().image.url).toBe('attachment://drawing.gif');
        expect(drawing.content).not.toContain('大吉');
        finishUpload();
        await vi.advanceTimersByTimeAsync(2999);
        expect(i.editReply).toHaveBeenCalledOnce();
        await vi.advanceTimersByTimeAsync(1);
        await run;
        expect(i.editReply).toHaveBeenCalledTimes(2);
        const result = i.editReply.mock.calls[1][0];
        expect(result.content).toContain('**大吉**でし！');
        expect(result.attachments).toEqual([]);
        expect(result.files[0].name).toBe('result.png');
        expect(result.embeds[0]).toBeInstanceOf(EmbedBuilder);
        expect(result.embeds[0].toJSON().image.url).toBe('attachment://result.png');
        expect(Math.random).toHaveBeenCalledOnce();
    });

    it.each(fortunes.map((fortune, index) => ({ ...fortune, index })))(
        '$name を対応する画像とテキストで返す',
        async (fortune) => {
            vi.mocked(Math.random).mockReturnValue((fortune.index + 0.5) / 7);
            const i = interaction();
            const run = execute(i);
            await vi.runAllTimersAsync();
            await run;
            const result = i.editReply.mock.calls[1][0];
            expect(result.content).toBe(`**${fortune.name}**でし！\n${fortune.message}`);
            expect(result.files[0].attachment).toMatch(new RegExp(`/${fortune.id}\\.png$`));
            expect(result.files[0].description).toContain(fortune.name);
            expect(result.embeds[0].toJSON().color).toBe(fortune.color);
        },
    );

    it('演出画像を送れなければ待たずに同じ結果を文字で返す', async () => {
        const i = interaction();
        i.editReply.mockRejectedValueOnce(new Error('Missing AttachFiles'));
        await execute(i);
        expect(i.editReply).toHaveBeenCalledTimes(2);
        expect(i.editReply.mock.calls[1][0]).toMatchObject({
            content: expect.stringContaining('**大吉**'),
            embeds: [],
            attachments: [],
        });
        expect(i.editReply.mock.calls[1][0]).not.toHaveProperty('files');
        expect(vi.getTimerCount()).toBe(0);
        expect(warn).toHaveBeenCalledOnce();
        expect(Math.random).toHaveBeenCalledOnce();
    });

    it('結果画像の送信失敗でも演出の添付を消して文字で返す', async () => {
        const i = interaction();
        i.editReply
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error('upload failed'));
        const run = execute(i);
        await vi.runAllTimersAsync();
        await run;
        expect(i.editReply).toHaveBeenCalledTimes(3);
        expect(i.editReply.mock.calls[2][0]).toMatchObject({
            content: expect.stringContaining('**大吉**'),
            embeds: [],
            attachments: [],
        });
        expect(i.editReply.mock.calls[2][0]).not.toHaveProperty('files');
        expect(warn).toHaveBeenCalledOnce();
        expect(Math.random).toHaveBeenCalledOnce();
    });

    it('文字での返信も失敗した場合は呼び出し元へエラーを返す', async () => {
        const i = interaction();
        i.editReply.mockRejectedValue(new Error('Unknown interaction'));
        await expect(execute(i)).rejects.toThrow('Unknown interaction');
    });

    it('同時に引いた人の結果や返信を混ぜない', async () => {
        vi.mocked(Math.random).mockReturnValueOnce(0).mockReturnValueOnce(0.999999);
        const a = interaction();
        const b = interaction();
        const runs = [execute(a), execute(b)];
        await vi.runAllTimersAsync();
        await Promise.all(runs);
        expect(a.editReply.mock.calls[1][0].content).toContain('**大吉**');
        expect(b.editReply.mock.calls[1][0].content).toContain('**末吉**');
        expect(a.editReply).toHaveBeenCalledTimes(2);
        expect(b.editReply).toHaveBeenCalledTimes(2);
    });

    it('スラッシュコマンドから実行できる', () => {
        expect(omikujiCommand.definition.toJSON()).toMatchObject({ name: 'おみくじ' });
        expect(omikujiCommand.execute).toBe(handleOmikuji);
    });
});

describe('同梱素材', () => {
    it('GIF と7種類の PNG があり、各ファイルは1 MB未満である', () => {
        const gif = readFileSync('images/omikuji/drawing.gif');
        expect(gif.subarray(0, 6).toString()).toBe('GIF89a');
        expect(gif.readUInt16LE(6)).toBe(640);
        expect(gif.readUInt16LE(8)).toBe(400);
        expect(gif.length).toBeLessThan(1_000_000);
        for (const fortune of fortunes) {
            const file = `images/omikuji/${fortune.id}.png`;
            const png = readFileSync(file);
            expect(png.subarray(1, 4).toString()).toBe('PNG');
            expect(png.readUInt32BE(16)).toBe(640);
            expect(png.readUInt32BE(20)).toBe(400);
            expect(statSync(file).size).toBeLessThan(1_000_000);
        }
    });
});
