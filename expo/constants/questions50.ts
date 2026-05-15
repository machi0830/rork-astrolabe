import type { DomainId } from '@/constants/domains';

export type Question50 = {
  id: number;
  domain: DomainId;
  subdomain: string;
  text: string;
  reverse: boolean;
};

export const REVERSE_ITEMS: number[] = [
  3, 5, 7, 9, 13, 15, 17, 19, 22, 24, 27, 29, 32, 36, 38, 41, 43, 45, 47,
];

export const QUESTIONS_50: Question50[] = [
  // 愛着スタイル Q0〜Q9
  { id: 0, domain: 'attachment', subdomain: 'anxiety', text: 'パートナーが本当に自分のことを好きかどうか、しょっちゅう不安になる', reverse: false },
  { id: 1, domain: 'attachment', subdomain: 'anxiety', text: 'パートナーに自分が感じるほどの愛情を相手は感じていないのではないかと心配になる', reverse: false },
  { id: 2, domain: 'attachment', subdomain: 'anxiety', text: 'パートナーが離れていくかもしれないという気持ちになると、パニックに近い感覚になる', reverse: false },
  { id: 3, domain: 'attachment', subdomain: 'anxiety', text: 'パートナーとの関係について必要以上に心配することはほとんどない', reverse: true },
  { id: 4, domain: 'attachment', subdomain: 'anxiety', text: 'パートナーに承認・確認してもらえないと、自分の気持ちが落ち着かないことがある', reverse: false },
  { id: 5, domain: 'attachment', subdomain: 'avoidance', text: 'パートナーに頼ることは、あまり好きではない', reverse: true },
  { id: 6, domain: 'attachment', subdomain: 'avoidance', text: '自分の感情や悩みをパートナーに正直に話すことは、比較的得意だ', reverse: false },
  { id: 7, domain: 'attachment', subdomain: 'avoidance', text: 'パートナーとの距離が近すぎると、少し不快になることがある', reverse: true },
  { id: 8, domain: 'attachment', subdomain: 'avoidance', text: '弱い部分を見せることは、関係において自然なことだと思う', reverse: false },
  { id: 9, domain: 'attachment', subdomain: 'avoidance', text: '自分の気持ちをオープンにしすぎると、あとで傷つくと感じることがある', reverse: true },
  // ビッグファイブ Q10〜Q19
  { id: 10, domain: 'bigfive', subdomain: 'N', text: '感情が不安定になりやすく、気分の波が大きい方だと思う', reverse: false },
  { id: 11, domain: 'bigfive', subdomain: 'N', text: 'ストレスがかかる場面でも、比較的落ち着いていられる', reverse: false },
  { id: 12, domain: 'bigfive', subdomain: 'A', text: '相手の立場に立って考えることが得意だ', reverse: false },
  { id: 13, domain: 'bigfive', subdomain: 'A', text: '他の人に対して批判的な見方をすることが多い', reverse: true },
  { id: 14, domain: 'bigfive', subdomain: 'C', text: 'パートナーとの約束や決め事は、きちんと守ろうとする', reverse: false },
  { id: 15, domain: 'bigfive', subdomain: 'C', text: '物事が中途半端になったり、後回しにすることが多い', reverse: true },
  { id: 16, domain: 'bigfive', subdomain: 'O', text: '関係において変化や成長を受け入れることが得意だ', reverse: false },
  { id: 17, domain: 'bigfive', subdomain: 'O', text: '新しい考え方や視点を柔軟に取り入れることができる', reverse: true },
  { id: 18, domain: 'bigfive', subdomain: 'E', text: 'パートナーとの時間でエネルギーが回復する感覚がある', reverse: false },
  { id: 19, domain: 'bigfive', subdomain: 'E', text: '人と長時間いると、精神的に疲れることが多い', reverse: true },
  // アサーション Q20〜Q29
  { id: 20, domain: 'assertion', subdomain: 'expression', text: '嫌だったことや傷ついたことを、「私は〜と感じた」という形で伝えることができる', reverse: false },
  { id: 21, domain: 'assertion', subdomain: 'expression', text: 'パートナーへの不満を伝えるとき、感情的になって責めてしまうことが多い', reverse: false },
  { id: 22, domain: 'assertion', subdomain: 'expression', text: '自分の意見や希望を、パートナーにきちんと伝えることができる', reverse: true },
  { id: 23, domain: 'assertion', subdomain: 'expression', text: '言わなくても気持ちをわかってほしいと思うことが多い', reverse: false },
  { id: 24, domain: 'assertion', subdomain: 'expression', text: '感情的な状況でも、言いたいことを整理して伝えられる方だ', reverse: true },
  { id: 25, domain: 'assertion', subdomain: 'boundary', text: '受け入れられないことを「それは難しい」とはっきり伝えられる', reverse: false },
  { id: 26, domain: 'assertion', subdomain: 'boundary', text: '断ることが苦手で、無理して合わせてしまうことが多い', reverse: false },
  { id: 27, domain: 'assertion', subdomain: 'boundary', text: '自分の限界や境界線を、相手が傷つかない形で伝えることができる', reverse: true },
  { id: 28, domain: 'assertion', subdomain: 'conflict', text: '話し合いの場で、自分の立場を落ち着いて表明することができる', reverse: false },
  { id: 29, domain: 'assertion', subdomain: 'conflict', text: '批判されると、防衛的になったり反撃したりしてしまうことが多い', reverse: true },
  // 感情知性EQ Q30〜Q39
  { id: 30, domain: 'eq', subdomain: 'selfAware', text: '自分がどのような感情を感じているか、ほとんどの場合言葉で表現できる', reverse: false },
  { id: 31, domain: 'eq', subdomain: 'selfAware', text: '自分の感情の変化を、比較的早く気づくことができる', reverse: false },
  { id: 32, domain: 'eq', subdomain: 'selfAware', text: '「なんとなくもやもやする」はわかるが、何を感じているかは正確にはわからないことが多い', reverse: true },
  { id: 33, domain: 'eq', subdomain: 'otherAware', text: 'パートナーの感情状態を、表情や言葉のトーンから読み取ることが得意だ', reverse: false },
  { id: 34, domain: 'eq', subdomain: 'otherAware', text: '相手が何を感じているか、敏感に察することができる', reverse: false },
  { id: 35, domain: 'eq', subdomain: 'useEmotion', text: '感情が高まっているとき、それをポジティブな力や行動に変えられることがある', reverse: false },
  { id: 36, domain: 'eq', subdomain: 'useEmotion', text: '感情的になると、物事がうまくいかなくなることが多い', reverse: true },
  { id: 37, domain: 'eq', subdomain: 'regulate', text: '強い怒りや不安が出てきたとき、少し時間を置いて落ち着いてから行動できる', reverse: false },
  { id: 38, domain: 'eq', subdomain: 'regulate', text: '嫌なことがあっても、比較的早く気持ちを立て直すことができる', reverse: true },
  { id: 39, domain: 'eq', subdomain: 'regulate', text: '一度感情的になると、なかなか落ち着けないことが多い', reverse: false },
  // 関係構築力 Q40〜Q49
  { id: 40, domain: 'relation', subdomain: 'criticism', text: '不満を伝えるとき、「今回のこと」として具体的に伝えることができる', reverse: false },
  { id: 41, domain: 'relation', subdomain: 'criticism', text: 'パートナーを責めるとき「あなたはいつも〜」と性格や人格を批判してしまうことがある', reverse: true },
  { id: 42, domain: 'relation', subdomain: 'contempt', text: '意見が合わなくても、パートナーへの基本的な敬意を保つことができる', reverse: false },
  { id: 43, domain: 'relation', subdomain: 'contempt', text: 'パートナーの言動を軽蔑したり、見下すような態度をとってしまうことがある', reverse: true },
  { id: 44, domain: 'relation', subdomain: 'defensiveness', text: '批判されたとき、言い訳や反撃より先に「自分にも非があるかも」と考えることができる', reverse: false },
  { id: 45, domain: 'relation', subdomain: 'defensiveness', text: '批判されると、すぐに防衛的になって反論してしまうことが多い', reverse: true },
  { id: 46, domain: 'relation', subdomain: 'stonewalling', text: '感情的な話し合いになっても、席を立ったり黙り込んだりせず留まることができる', reverse: false },
  { id: 47, domain: 'relation', subdomain: 'stonewalling', text: '議論が白熱すると、その場を離れたり完全に黙ってしまうことがある', reverse: true },
  { id: 48, domain: 'relation', subdomain: 'repair', text: '対立の後、自分から話しかけて関係を修復しようとする行動をとれる', reverse: false },
  { id: 49, domain: 'relation', subdomain: 'repair', text: '喧嘩の後、お互いの立場を振り返り、建設的に話し合うことができる', reverse: false },
];

export const PRO_DOMAIN_BOUNDARIES = new Set<number>([9, 19, 29, 39]);
