import Colors from '@/constants/colors';
import type { GenreId } from '@/constants/genres';
import type { DomainId } from '@/constants/domains';

export interface IfThenProposal {
  ifTrigger: string;
  thenAction: string;
  domain: DomainId;
  color: string;
}

export const IF_THEN_TEMPLATES: Record<GenreId, IfThenProposal[]> = {
  anxiety: [
    { ifTrigger: '不安を感じたら', thenAction: '「今感じていること」を紙に3行だけ書く', domain: 'attachment', color: Colors.attachment },
    { ifTrigger: '返信を待つ間は', thenAction: '今の自分が楽しめることをひとつ始める', domain: 'eq', color: Colors.eq },
    { ifTrigger: '確認・問い詰めたくなったら', thenAction: '「私は今○○と感じている」と一度だけ伝える', domain: 'assertion', color: Colors.assertion },
  ],
  anger: [
    { ifTrigger: '怒りを感じたら', thenAction: '「今すぐ言う」前に30分だけ待つ', domain: 'eq', color: Colors.eq },
    { ifTrigger: '責めそうになったら', thenAction: '「あなたが○○した」ではなく「私は○○と感じた」で話す', domain: 'assertion', color: Colors.assertion },
    { ifTrigger: '小さな不満が積み重なったら', thenAction: '週に1回、小さなことを穏やかに伝える練習をする', domain: 'relation', color: Colors.relation },
  ],
  mismatch: [
    { ifTrigger: '話がかみ合わなくなったら', thenAction: '「今どんな気持ちか教えて」とひとつだけ聞く', domain: 'relation', color: Colors.relation },
    { ifTrigger: '黙り込みそうになったら', thenAction: '「少し時間をおいてから話せる？」と伝える', domain: 'assertion', color: Colors.assertion },
    { ifTrigger: '伝わらない感覚が続いたら', thenAction: '「私はこういう意味で言った」と一文で整理する', domain: 'eq', color: Colors.eq },
  ],
  selfesteem: [
    { ifTrigger: '「足りない」と感じたら', thenAction: '「今の自分にできること」をひとつ書き出す', domain: 'bigfive', color: Colors.bigfive },
    { ifTrigger: '不安な考えが頭を占めたら', thenAction: '「これは事実か、それとも自分の解釈か？」と問い直す', domain: 'eq', color: Colors.eq },
    { ifTrigger: '承認を求めたくなったら', thenAction: 'まず自分で自分を認める言葉をひとつ見つける', domain: 'attachment', color: Colors.attachment },
  ],
  values: [
    { ifTrigger: '価値観のズレを感じたら', thenAction: '「なぜそう思うのか」をひとつだけ聞いてみる', domain: 'bigfive', color: Colors.bigfive },
    { ifTrigger: '合わせて我慢しそうになったら', thenAction: '「これは譲れる？譲れない？」と自分に確認してから話す', domain: 'assertion', color: Colors.assertion },
    { ifTrigger: '話し合いがどちらが正しいかになったら', thenAction: '「正しいかどうかより、どうしたいか」に話を切り替える', domain: 'relation', color: Colors.relation },
  ],
  future: [
    { ifTrigger: '別れへの不安が出てきたら', thenAction: '「今日のこの人の、好きなところ」をひとつ思い出す', domain: 'eq', color: Colors.eq },
    { ifTrigger: '先が見えない感覚になったら', thenAction: '「3ヶ月先の、ふたりの小さな楽しみ」をひとつ作る', domain: 'relation', color: Colors.relation },
    { ifTrigger: '将来の話で不安になったら', thenAction: '「今の自分が変えられること」をひとつ考える', domain: 'bigfive', color: Colors.bigfive },
  ],
};

export const INSIGHT_TEXT: Record<GenreId, string> = {
  anxiety: '不安や嫉妬の背景に、愛着のパターンが見えてきました。',
  anger: '怒りや不満の奥に、伝えたい気持ちが隠れています。',
  mismatch: 'すれ違いは、お互いの「わかってほしい」の交差点です。',
  selfesteem: '自己肯定感の揺れは、自分を知る大切なサインです。',
  values: '価値観の違いは、対話を深めるための素材になります。',
  future: '未来への不安は、今をより大切にしようとする力です。',
};
