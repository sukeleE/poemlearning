// ===== 数据定义 =====

// 作者资料库
const authorData = {
    '李白': {
        bio: `🥂 李白：盛唐的浪漫与狂想
📜 生平剪影（701年－762年）

少年游侠：生于碎叶城（今吉尔吉斯斯坦），5岁随父入蜀。15岁习剑术、纵横术，24岁"仗剑去国，辞亲远游"，足迹遍布大半个中国。

长安高光：42岁奉诏入京，任翰林待诏。玄宗虽爱其才，却只视为御用文人。因狂放不羁（如"力士脱靴"），三年后遭赐金放还。

乱世飘零：安史之乱中卷入永王李璘幕府，被流放夜郎。晚年投靠族叔李阳冰，传说最终"醉入水中捉月而死"。

🏆 成就与诗风

诗仙：将浪漫主义推向极致，想象力天马行空（"飞流直下三千尺"）。

自由体：最擅长古风与乐府，打破格律束缚，语言如"清水出芙蓉，天然去雕饰"。

精神内核：极度自信（"天生我材必有用"）、及时行乐（"人生得意须尽欢"）、蔑视权贵（"安能摧眉折腰事权贵"）。

代表作：《蜀道难》《将进酒》《梦游天姥吟留别》`,
        selfIntro: `李白：我是那个仗剑天涯的"谪仙人"

世人皆唤我"诗仙"，说我酒入豪肠，七分酿成了月光，余下三分啸成剑气。其实，我这一生，不过是在做一个醒不来的大梦罢了。

我生于碎叶，长于蜀中。少时我便不爱经书，却偏爱剑术与道经。我曾"十五好剑术，遍干诸侯"，以为凭一身才华与侠气，便能在这乱世中博取功名。二十四岁那一年，我"仗剑去国，辞亲远游"，那是何等的意气风发！我登黄鹤楼，观庐山瀑布，写下"飞流直下三千尺，疑是银河落九天"。那时的我，以为天地之大，皆可尽收眼底。

然而，漫游半生，直到四十二岁，我才因玉真公主之荐，奉诏入京。天子"降辇步迎，如见绮皓"，那是我的高光时刻。可长安三年，不过是御用文人的生涯，为贵妃写《清平调》，陪玄宗赏牡丹。我这才明白，他们需要的不是一个政治家，而是一个点缀太平的弄臣。于是我高喊"安能摧眉折腰事权贵，使我不得开心颜"，再次拂袖而去，散发弄扁舟。

晚年我卷入永王李璘案，流放夜郎，虽中途遇赦，但那颗飞扬的心已染上尘埃。我这一生，求仙问道，却始终未能羽化登仙；渴望济世，终究只是镜花水月。如今我醉卧于宣城谢朓楼，看着江水东流，只觉"抽刀断水水更流，举杯消愁愁更愁"。若问我一生何求？不过是"事了拂衣去，深藏身与名"罢了。`
    },
    '杜甫': {
        bio: `📖 杜甫：乱世的良心与史笔
📜 生平剪影（712年－770年）

年少优游：出身京兆杜氏，早年家境优渥，曾漫游吴越、齐赵，并与李白结下深厚友谊。

长安困守：35岁赴长安求仕，科考落第，困居十年，目睹"朱门酒肉臭，路有冻死骨"的阶级撕裂。

乱世流亡：安史之乱中颠沛流离，被俘后逃出，任左拾遗。晚年携家漂泊西南，最终病逝于湘江舟中。

🏆 成就与诗风

诗圣：将现实主义推向高峰，其诗被称为"诗史"，精准记录了唐朝由盛转衰的痛感。

律诗之巅：尤擅七律，格律精严，沉郁顿挫。善用细节白描刻画民生疾苦。

精神内核：忧国忧民（"国破山河在"）、仁爱之心（"安得广厦千万间"）、历史责任感。

代表作：《三吏》《三别》《春望》《登高》`,
        selfIntro: `杜甫：我是那个记录时代的"老病孤舟"

他们都叫我"诗圣"，但我自己知道，我只是个"百年多病独登台"的老头儿。我的诗不是写给后世传颂的，而是写给我自己看的，写给这破碎的山河看的。

我出身京兆杜氏，祖父杜审言是初唐名家。我七岁咏凤凰，十五游翰墨场，自视甚高，以为"致君尧舜上，再使风俗淳"是轻而易举的事。可现实给了我一记响亮的耳光。我困守长安十年，"朝扣富儿门，暮随肥马尘"，换来的却是"残杯与冷炙，到处潜悲辛"。直到安史之乱爆发，我才真正看清这个帝国的疮痍。

那是我人生最痛苦，也是创作最高产的时期。我看着"国破山河在，城春草木深"，看着妻离子散，看着征夫怨妇。我写的不是诗，是血泪。在逃难路上，我写出"三吏"、"三别"，那每一个字，都是从底层百姓的骨头里抠出来的。后来我漂泊西南，筑草堂于成都，本以为有了片刻安宁，却又遇上军阀混战。

我的一生，就像一艘破败的小船，"亲朋无一字，老病有孤舟"。我没有李白的飘逸，也没有王维的禅意，我只有沉郁顿挫的笔触，死死咬住这个动荡的时代不放。我死后，我的诗集或许会被遗忘，但我不在乎。我只希望，千年后若有人读到"朱门酒肉臭，路有冻死骨"，还能记得大唐曾有这样一段不堪回首的岁月，便足矣。`
    },
    '王维': {
        bio: `🍃 王维：诗画禅意的融合
📜 生平剪影（701年－761年）

少年得志：21岁状元及第，精通音律，曾官至尚书右丞。安史之乱中被叛军所俘，被迫出任伪职，乱平后险遭杀身之祸。

半官半隐：中年丧妻后未再娶，在蓝田辋川别墅过着亦官亦隐的生活，笃信佛教，吃斋念佛。

诗佛境界：晚年彻底看透仕途，追求精神上的超脱。

🏆 成就与诗风

诗佛：开创"诗中有画，画中有诗"的意境，将山水诗与禅宗哲理完美结合。

五言圣手：语言清新洗练，善用空、静、闲等字眼营造空灵境界（"空山新雨后"）。

精神内核：禅意（"行到水穷处，坐看云起时"）、物我两忘、艺术化的生活。

代表作：《山居秋暝》《使至塞上》《相思》《鹿柴》`,
        selfIntro: `王维：我是那个亦官亦隐的"诗佛"

人谓我"诗中有画，画中有诗"，又封我为"诗佛"。其实，我这一生，不过是在仕与隐之间，寻找一个安放灵魂的角落罢了。

早年我也曾有过"新丰美酒斗十千，咸阳游侠多少年"的豪情。十七岁写下"独在异乡为异客，每逢佳节倍思亲"，那份孤独感似乎注定了我一生的底色。我在官场浮沉，历经张九龄罢相、李林甫专权等政治风波。我逐渐明白，在这个污浊的红尘里，想要保全自身，唯有"中隐"。

于是，我在蓝田辋川别业，半官半隐。那里有空山新雨，有明月松林，有竹喧归浣女，莲动下渔舟。我弹琴赋诗，吃斋奉佛，试图在山水田园中参透生命的真谛。我写"行到水穷处，坐看云起时"，这不是消极，而是一种勘破后的从容。我虽然身在朝廷，官至尚书右丞，但我心早已寄于山水。

安史之乱时，我被叛军俘虏，被迫接受伪职。这是我最不堪回首的往事。虽然后来因写过怀念唐室的诗而被宽恕，但这份污点始终如影随形。晚年的我，更是长斋绣佛，退朝之后，焚香独坐，以禅诵为事。我这一生，诗是心的镜子，画是意的延伸。我没有什么惊天动地的故事，只是在纷扰人世间，努力修得一颗清净心而已。`
    },
    '孟浩然': {
        bio: `🌾 孟浩然：布衣诗人的山水清音
📜 生平剪影（689年－740年）

终身不仕：襄阳人，40岁前隐居鹿门山。曾赴长安科考落第，后漫游吴越。传说因一句"不才明主弃"惹怒唐玄宗，断送仕途。

山水知己：与王维并称"王孟"，是李白极度崇拜的前辈（"吾爱孟夫子，风流天下闻"）。

布衣终老：一生绝大部分时间在故乡襄阳及江南山水间度过，以隐士身份终老。

🏆 成就与诗风

山水田园派奠基人：诗风清淡自然，贴近日常生活，少用典故。

五言长城：尤擅五言律诗，语言质朴如白话（"春眠不觉晓"），却意境悠远。

精神内核：淡泊名利（"红颜弃轩冕"）、亲近自然、隐逸情怀。

代表作：《春晓》《过故人庄》《宿建德江》《望洞庭湖赠张丞相》`,
        selfIntro: `孟浩然：我是那个"红颜弃轩冕"的布衣诗人

世人常拿我与王维并称"王孟"，但我自知，我远不如他的圆融通透。我这一生，没有做过一天官，却也因此保全了一生清白。

我生于襄阳，是个地道的湖北佬。年轻时，我也曾向往过功名，所谓"冲天羡鸿鹄"。但在长安应试落第后，我便彻底断了念头。那天在太学赋诗，座中诸公皆叹服，可我却觉得索然无味。我想起那天在终南山，对着"不才明主弃，多病故人疏"的牢骚，竟被玄宗当面斥责，那一刻我才明白，我这山野之人，终究穿不惯官场的锦袍。

于是，我回到了鹿门山。那里才是我的归宿。"岩扉松径长寂寥，惟有幽人自来去。"我种梅花，钓潭鱼，与农人把酒话桑麻。朋友问我为何隐居，我说"红颜弃轩冕，白首卧松云"。其实哪有那么潇洒，不过是知进退罢了。

我与李白是忘年交，他曾羡慕我"高山安可仰，徒此揖清芬"；我也常与王维在竹里馆对饮。但我知道，王维是身在魏阙心在江湖，而我，是彻底的山野村夫。我这一生，没有惊心动魄的故事，只有淡淡的山水和微醺的月光。我的诗，就像襄阳的汉江水，清澈见底，波澜不惊。最后我因背疽发作而死，也算是无疾而终。若有来世，我仍愿做那个"开轩面场圃，把酒话桑麻"的孟山人。`
    }
};

// 视频资源库 - 使用独立的 HTML 视频页面
const videoData = {
    '李白': {
        iframe: 'assets/web/videos/libai.html'
    },
    '杜甫': {
        iframe: 'assets/web/videos/dufu.html'
    },
    '王维': {
        iframe: 'assets/web/videos/wangwei.html'
    },
    '孟浩然': {
        iframe: 'assets/web/videos/menghaoran.html'
    },
    '将进酒': {
        朗读: 'assets/web/videos/jiangjinjiu-langu.html',
        解析: 'assets/web/videos/jiangjinjiu-jiexi.html'
    },
    '登高': {
        朗诵: 'assets/web/videos/denggao-songdu.html',
        解析: 'assets/web/videos/denggao-jiexi.html'
    },
    '山居秋暝': {
        朗诵: 'assets/web/videos/shanju-songdu.html'
    },
    '格律': {
        视频一: 'assets/web/videos/gelv-1.html',
        视频二: 'assets/web/videos/gelv-2.html',
        视频三: 'assets/web/videos/gelv-3.html'
    },
    '意象': {
        视频一: 'assets/web/videos/yixiang-1.html',
        视频二: 'assets/web/videos/yixiang-2.html',
        视频三: 'assets/web/videos/yixiang-3.html'
    },
    '创作': {
        视频一: 'assets/web/videos/chuangzuo-1.html',
        视频二: 'assets/web/videos/chuangzuo-2.html',
        视频三: 'assets/web/videos/chuangzuo-3.html'
    }
};

// 古诗资料库
const poemData = {
    '诗境长卷': {
        author: '古诗教学一体化',
        content: '诗境长卷展古今，古典诗歌焕新音。山水田园皆入画，唐宋风韵共登临。',
        analysis: `诗境长卷是一个专注于中国古典诗歌教学的一体化平台，通过现代技术手段重现古典诗歌的美学意境。\n\n平台定位：诗境长卷是一个专注于中国古典诗歌教学的一体化平台，通过现代技术手段重现古典诗歌的美学意境。\n\n核心功能：包含古诗欣赏、详细解析、格律学习、意象分析以及互动创作等多个模块，为学习者提供全方位的诗歌学习体验。\n\n设计理念：融合传统与现代，通过视觉、听觉等多感官体验，让学习者在沉浸式环境中感受古典诗歌的魅力，培养对传统文化的热爱。\n\n教学价值：不仅帮助学习者理解诗歌的字面意义，更能深入体会诗歌背后的文化内涵和艺术价值，提升审美能力和文化素养。`
    },
    '将进酒': {
        author: '李白',
        content: `君不见黄河之水天上来，奔流到海不复回。
君不见高堂明镜悲白发，朝如青丝暮成雪。
人生得意须尽欢，莫使金樽空对月。
天生我材必有用，千金散尽还复来。
烹羊宰牛且为乐，会须一饮三百杯。
岑夫子，丹丘生，将进酒，杯莫停。
与君歌一曲，请君为我倾耳听。
钟鼓馔玉不足贵，但愿长醉不复醒。
古来圣贤皆寂寞，惟有饮者留其名。
陈王昔时宴平乐，斗酒十千恣欢谑。
主人何为言少钱，径须沽取对君酌。
五花马，千金裘，呼儿将出换美酒，与尔同销万古愁。`,
        analysis: `《将进酒》是唐代大诗人李白沿用乐府古题创作的一首诗。此诗思想内容非常深沉，艺术表现非常成熟，在同题作品中影响最大。诗人豪饮高歌，借酒消愁，抒发了忧愤深广的人生感慨。诗中交织着失望与自信、悲愤与抗争的情怀，体现出强烈的豪纵狂放的个性。

全诗情感饱满，无论喜怒哀乐，其奔涌迸发均如江河流泻，不可遏止，且起伏跌宕，变化剧烈；在手法上多用夸张，且往往以巨额数量词进行修饰，既表现出诗人豪迈洒脱的情怀，又使诗作本身显得笔墨酣畅，抒情有力；在结构上大开大阖，充分体现了李白七言歌行的特色。`
    },
    '登高': {
        author: '杜甫',
        content: `风急天高猿啸哀，渚清沙白鸟飞回。
无边落木萧萧下，不尽长江滚滚来。
万里悲秋常作客，百年多病独登台。
艰难苦恨繁霜鬓，潦倒新停浊酒杯。`,
        analysis: `《登高》是唐代伟大诗人杜甫于大历二年（767）秋天在夔州所作的一首七律。前四句写景，述登高见闻，紧扣秋天的季节特色，描绘了江边空旷寂寥的景致。首联为局部近景，颔联为整体远景。后四句抒情，写登高所感，围绕作者自己的身世遭遇，抒发了穷困潦倒、年老多病、流寓他乡的悲哀之情。颈联自伤身世，将前四句写景所蕴含的比兴、象征、暗示之意揭出；尾联再作申述，以衰愁病苦的自我形象收束。

此诗语言精练，通篇对偶，一二句尚有句中对，充分显示了杜甫晚年对诗歌语言声律的把握运用已达圆通之境。`
    },
    '山居秋暝': {
        author: '王维',
        content: `空山新雨后，天气晚来秋。
明月松间照，清泉石上流。
竹喧归浣女，莲动下渔舟。
随意春芳歇，王孙自可留。`,
        analysis: `《山居秋暝》是唐代诗人王维的作品。此诗描绘了秋雨初晴后傍晚时分山村的旖旎风光和山居村民的淳朴风尚，表现了诗人寄情山水田园并对隐居生活怡然自得的满足心情，以自然美来表现人格美和社会美。

全诗将空山雨后的秋凉，松间明月的光照，石上清泉的声音以及浣女归来竹林中的喧笑声，渔船穿过荷花的动态，和谐完美地融合在一起，给人一种丰富新鲜的感受。它像一幅清新秀丽的山水画，又像一支恬静优美的抒情乐曲，体现了王维诗中有画的创作特点。`
    },
    '宿建德江': {
        author: '孟浩然',
        content: `移舟泊烟渚，日暮客愁新。
野旷天低树，江清月近人。`,
        analysis: `《宿建德江》是唐代诗人孟浩然的代表作之一。这是一首刻画秋江暮色的诗，是唐人五绝中的写景名篇。作者把小船停靠在烟雾迷蒙的江边想起了以往的事情，因而以舟泊暮宿作为自己的抒发感情的归宿，写出了作者羁旅之思。

第一句点题，为下文写景抒情作准备；第二句中"日暮"是"客愁新"的原因；最后两句，因为"野旷"所以天低于树，因为"江清"所以月能近人，天和树、人和月的关系，写得恰切逼真。此诗前两句为触景生情，后两句为借景抒情，描写了清新的秋夜，突出表现了细微的景物特点。全诗淡而有味，含而不露，自然流出，风韵天成，颇有特色。`
    }
};

// ===== 卡片管理系统（基于.poem-line-detail设计） =====

let activeCard = null;

function ensureAuthorCardOnTopLayer(cardElement) {
    if (!cardElement || cardElement.__movedToBodyLayer) return;
    if (cardElement.parentNode === document.body) {
        cardElement.__movedToBodyLayer = true;
        return;
    }
    document.body.appendChild(cardElement);
    cardElement.__movedToBodyLayer = true;
}

function displayCard(cardElement) {
    if (activeCard && activeCard !== cardElement) {
        dismissCard(activeCard);
    }

    cardElement.classList.add('poem-line-detail');

    // 检查是否是作者卡片
    const isAuthorCard = cardElement.id && cardElement.id.startsWith('author-card-');

    if (isAuthorCard) {
        ensureAuthorCardOnTopLayer(cardElement);
        // 作者卡片：右上角展开，但仍沿用 poem-line-detail 的统一显隐逻辑
        cardElement.classList.remove('author-card--dock');
        cardElement.classList.add('author-card--overlay');
        cardElement.style.position = '';
        cardElement.style.left = '';
        cardElement.style.bottom = '';
        cardElement.style.top = '';
        cardElement.style.right = '';
        cardElement.style.zIndex = '2147483647';
        cardElement.style.width = '';
        cardElement.style.maxWidth = '';
        cardElement.style.maxHeight = '';
        cardElement.style.margin = '';
        cardElement.style.padding = '';
        cardElement.style.overflow = '';
        cardElement.style.writingMode = 'horizontal-tb';
        cardElement.style.transformOrigin = '100% 0%';
    } else {
        // 其他卡片：相对定位，随页面滚动
        cardElement.classList.remove('author-card--dock');
        cardElement.classList.remove('author-card--overlay');
        cardElement.style.position = 'relative';
        cardElement.style.top = 'auto';
        cardElement.style.right = 'auto';
        cardElement.style.bottom = 'auto';
        cardElement.style.left = 'auto';
        cardElement.style.width = '100%';
        cardElement.style.maxWidth = '100%';
        cardElement.style.zIndex = 'auto';
        cardElement.style.maxHeight = 'none';
        cardElement.style.writingMode = 'horizontal-tb';
        cardElement.style.transformOrigin = '100% 100%';
    }

    attachCloseButton(cardElement);

    cardElement.style.display = 'block';

    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            cardElement.classList.remove('is-hiding');
            cardElement.classList.add('is-visible');
        });
    });

    activeCard = cardElement;
}

function dismissCard(cardElement) {
    if (!cardElement) return;

    cardElement.classList.remove('is-visible');
    cardElement.classList.add('is-hiding');

    setTimeout(function() {
        cardElement.style.display = 'none';
        cardElement.classList.remove('is-hiding');
        if (activeCard === cardElement) {
            activeCard = null;
            removeVideoPlayer();
            concealImageText();
        }
    }, 560);
}

function attachCloseButton(cardElement) {
    if (cardElement.querySelector('.close-button')) return;

    var btn = document.createElement('button');
    btn.className = 'close-button';
    btn.textContent = '×';
    btn.style.cssText = 'position:absolute;top:10px;right:10px;background:rgba(159,59,47,0.7);color:#fff;border:none;border-radius:50%;width:28px;height:28px;font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:all 0.2s ease;';

    btn.addEventListener('mouseenter', function() {
        btn.style.background = 'rgba(159,59,47,1)';
        btn.style.transform = 'scale(1.1)';
    });

    btn.addEventListener('mouseleave', function() {
        btn.style.background = 'rgba(159,59,47,0.7)';
        btn.style.transform = 'scale(1)';
    });

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dismissCard(cardElement);
    });

    cardElement.appendChild(btn);
}

// ===== 视频播放器系统 =====

var videoContainerRef = null;
var videoSourceData = null;
var videoCurrentIdx = 0;
var videoPlaylist = [];

function buildVideoPlayer() {
    var existing = document.getElementById('video-container');
    if (existing) return existing;

    var wrapper = document.createElement('div');
    wrapper.id = 'video-container';
    wrapper.style.cssText = 'position:relative;width:100%;max-width:800px;height:auto;background:rgba(243,238,226,0.95);border:1px solid rgba(125,96,60,0.3);border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.15);margin-top:15px;overflow:hidden;display:none;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);';

    var screen = document.createElement('div');
    screen.id = 'video-content';
    screen.style.cssText = 'width:100%;padding-top:56.25%;position:relative;cursor:pointer;background:rgba(0,0,0,0.02);transition:background 0.3s ease;';

    var videoFrame = document.createElement('iframe');
    videoFrame.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';

    screen.addEventListener('mouseenter', function() { screen.style.background = 'rgba(0,0,0,0.05)'; });
    screen.addEventListener('mouseleave', function() { screen.style.background = 'rgba(0,0,0,0.02)'; });
    screen.appendChild(videoFrame);
    wrapper.appendChild(screen);

    var toolbar = document.createElement('div');
    toolbar.style.cssText = 'width:100%;height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;box-sizing:border-box;background:rgba(125,96,60,0.08);border-top:1px solid rgba(125,96,60,0.15);';

    var closeBtn = makeVideoBtn('×', function() { removeVideoPlayer(); });
    var prevBtn = makeVideoBtn('← 上一个', function() { navigateVideo(-1); });
    var nextBtn = makeVideoBtn('下一个 →', function() { navigateVideo(1); });
    var titleSpan = document.createElement('span');
    titleSpan.id = 'video-title';
    titleSpan.style.cssText = 'font-size:14px;color:#5a422b;font-family:"STSong","SimSun",serif;flex:1;text-align:center;font-weight:500;';

    var leftBar = document.createElement('div');
    leftBar.style.display = 'flex';
    leftBar.style.gap = '8px';
    leftBar.appendChild(closeBtn);
    leftBar.appendChild(prevBtn);

    var rightBar = document.createElement('div');
    rightBar.style.display = 'flex';
    rightBar.style.gap = '8px';
    rightBar.appendChild(nextBtn);

    toolbar.appendChild(leftBar);
    toolbar.appendChild(titleSpan);
    toolbar.appendChild(rightBar);

    wrapper.appendChild(toolbar);

    return wrapper;
}

function makeVideoBtn(label, handler) {
    var el = document.createElement('button');
    el.textContent = label;
    el.style.cssText = 'background:rgba(159,59,47,0.85);color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:13px;font-family:"STSong","SimSun",serif;transition:all 0.2s ease;';
    el.addEventListener('mouseenter', function() { el.style.background = 'rgba(159,59,47,1)'; el.style.transform = 'translateY(-1px)'; });
    el.addEventListener('mouseleave', function() { el.style.background = 'rgba(159,59,47,0.85)'; el.style.transform = 'translateY(0)'; });
    el.onclick = handler;
    return el;
}

function renderVideo() {
    if (!videoSourceData || !videoContainerRef) return;

    var screen = document.getElementById('video-content');
    var title = document.getElementById('video-title');
    if (!screen || !title) return;

    var iframe = screen.querySelector('iframe');
    if (iframe) {
        iframe.src = videoSourceData.iframe;
    }

    var label = videoSourceData.key;
    if (videoSourceData.type !== 'iframe') {
        label += ' - ' + videoSourceData.type;
    }
    title.textContent = label;
}

// 播放与古诗或作者相关的视频（朗读、解析、作者介绍）
function playPoemVideos(name, options) {
    if (typeof window.openVideoCollectionByKey === 'function') {
        window.openVideoCollectionByKey(name, options || {});
        return;
    }

    // 检查是否是作者名字
    if (authorData[name]) {
        // 直接播放作者介绍视频
        videoPlaylist = [];
        videoCurrentIdx = 0;
        
        if (videoData[name]) {
            videoPlaylist.push({ key: name, type: '作者介绍', iframe: videoData[name].iframe });
        }
        
        if (videoPlaylist.length === 0) return;
        
        var existingPlayer = document.getElementById('video-container');
        if (existingPlayer) {
            existingPlayer.parentNode.removeChild(existingPlayer);
        }
        
        var player = buildVideoPlayer();
        // 插入到页面底部
        document.body.appendChild(player);
        
        videoSourceData = videoPlaylist[0];
        renderVideo();
        player.style.display = 'block';
        videoContainerRef = player;
        return;
    }
    
    // 原逻辑：处理古诗名字
    if (!poemData[name]) return;

    var poemCard = document.getElementById('poem-info-card-' + name);

    videoPlaylist = [];
    videoCurrentIdx = 0;

    var poem = poemData[name];
    var author = poem.author;

    if (videoData[name]) {
        for (var type in videoData[name]) {
            if (videoData[name].hasOwnProperty(type)) {
                videoPlaylist.push({ key: name, type: type, iframe: videoData[name][type] });
            }
        }
    }

    if (videoData[author]) {
        videoPlaylist.push({ key: author, type: '作者介绍', iframe: videoData[author].iframe });
    }

    if (videoPlaylist.length === 0) return;

    var existingPlayer = document.getElementById('video-container');
    if (existingPlayer) {
        existingPlayer.parentNode.removeChild(existingPlayer);
    }

    var player = buildVideoPlayer();

    if (poemCard && poemCard.parentNode) {
        poemCard.parentNode.insertBefore(player, poemCard.nextSibling);
    } else {
        document.body.appendChild(player);
    }

    videoSourceData = videoPlaylist[0];
    renderVideo();
    player.style.display = 'block';
    videoContainerRef = player;
}

function navigateVideo(dir) {
    if (videoPlaylist.length === 0) return;
    videoCurrentIdx = (videoCurrentIdx + dir + videoPlaylist.length) % videoPlaylist.length;
    videoSourceData = videoPlaylist[videoCurrentIdx];
    renderVideo();
}

function removeVideoPlayer() {
    if (videoContainerRef) {
        if (videoContainerRef.parentNode) {
            videoContainerRef.parentNode.removeChild(videoContainerRef);
        }
        videoContainerRef = null;
        videoSourceData = null;
        videoPlaylist = [];
        videoCurrentIdx = 0;
    }
}

// ===== 图片文本动效 =====

function prepareImageText() {
    var items = document.querySelectorAll('.image-text');
    for (var i = 0; i < items.length; i++) {
        items[i].style.display = 'none';
        items[i].style.opacity = '0';
        items[i].style.transform = 'translateX(-1rem)';
        items[i].style.transition = 'all 0.3s ease';
        items[i].style.cursor = 'pointer';
        items[i].style.borderBottom = '1px solid transparent';

        items[i].addEventListener('mouseover', function() {
            this.style.color = 'var(--accent-600)';
            this.style.transform = 'translateX(0.5rem)';
            this.style.borderBottomColor = 'var(--accent-400)';
        });

        items[i].addEventListener('mouseout', function() {
            this.style.color = '';
            this.style.transform = 'translateX(0)';
            this.style.borderBottomColor = 'transparent';
        });
    }
}

function revealImageText() {
    var items = document.querySelectorAll('.image-text');
    for (var i = 0; i < items.length; i++) {
        items[i].style.display = 'block';
        (function(el) {
            setTimeout(function() {
                el.style.opacity = '1';
                el.style.transform = 'translateX(0)';
            }, 10);
        })(items[i]);
    }
}

function concealImageText() {
    var items = document.querySelectorAll('.image-text');
    for (var i = 0; i < items.length; i++) {
        items[i].style.opacity = '0';
        items[i].style.transform = 'translateX(-1rem)';
        (function(el) {
            setTimeout(function() { el.style.display = 'none'; }, 300);
        })(items[i]);
    }
}

// ===== 卡片操作入口 =====

function openAuthorCard(name, sourcePoem, sourceSection) {
    if (!authorData[name]) return;

    var panel = document.getElementById('author-card-' + name);
    if (!panel) return;

    if (panel.style.display !== 'none' && panel.classList.contains('is-visible')) {
        dismissCard(panel);
        return;
    }

    collapsePoemAnalysisCardsOnly(sourceSection || (panel.closest ? panel.closest('.snap-section--poem') : null));
    if (typeof window.closeVideoCollection === 'function') {
        window.closeVideoCollection();
    }

    displayCard(panel);
    // 显示作者相关视频，若位于具体诗页则优先加载该诗对应视频集并将作者介绍置顶
    var hostSection = sourceSection || (panel.closest ? panel.closest('.snap-section--poem') : null);
    playPoemVideos(sourcePoem || name, { preferredType: '作者介绍', trigger: 'author', section: hostSection });
    revealImageText();
}

function collapsePoemAnalysisCardsOnly(section) {
    if (!section) return;
    var inner = section.querySelector('.snap-section__inner');
    if (!inner) return;

    // 仅关闭“诗句/导读赏析卡”，保留正文展开态与 AI 对话卡片
    var details = inner.querySelectorAll('.poem-line-detail');
    details.forEach(function (detail) {
        detail.classList.remove('is-visible');
        detail.classList.remove('is-hiding');
        detail.style.display = 'none';
    });

    var transientTitles = inner.querySelectorAll(':scope > .detail-outer-title, :scope > .section-fly-title');
    transientTitles.forEach(function (el) { el.remove(); });
    inner.classList.remove('is-showing-detail');
}

function buildPoemCard(name, triggerElement) {
    var panel = document.getElementById('poem-info-card-' + name);

    if (panel) {
        if (panel.style.display === 'none') {
            displayCard(panel);
            playPoemVideos(name);
            revealImageText();
        } else {
            dismissCard(panel);
            removeVideoPlayer();
        }
        return;
    }

    panel = document.createElement('div');
    panel.id = 'poem-info-card-' + name;
    panel.style.cssText = 'display:none;padding:25px;max-width:500px;max-height:70vh;font-size:0.9em;line-height:1.8;color:#5a422b;font-family:"STSong","SimSun",serif;';

    var info = poemData[name];
    if (info) {
        var txt = info.content.replace(/\n/g, '<br>');
        var ana = info.analysis.replace(/\n/g, '<br>');

        panel.innerHTML = '<h3 style="margin:0 0 15px 0;font-size:1.2em;color:var(--zhu);">《' + name + '》</h3>' +
            '<p style="margin:0 0 15px 0;font-size:0.95em;color:#8a7a65;">古诗档案</p>' +
            '<div style="margin-bottom:15px;"><strong>作者：</strong>' + info.author + '</div>' +
            '<div style="margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid rgba(125,96,60,0.2);"><h5 style="margin:0 0 10px 0;font-size:1em;color:var(--zhu);">诗歌内容</h5><div style="font-style:italic;">' + txt + '</div></div>' +
            '<div><h5 style="margin:0 0 10px 0;font-size:1em;color:var(--zhu);">诗歌赏析</h5><div>' + ana + '</div></div>';
    }

    if (triggerElement && triggerElement.parentNode) {
        triggerElement.parentNode.insertBefore(panel, triggerElement.nextSibling);
    } else {
        document.body.appendChild(panel);
    }

    displayCard(panel);
    playPoemVideos(name);
    revealImageText();
}

// ===== 初始化交互 =====

function initAuthorInfo() {
    var authorEls = document.querySelectorAll('.author-info[data-author]');
    authorEls.forEach(function(el) {
        var name = el.dataset.author;
        if (!authorData[name]) return;

        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s ease';
        el.style.color = '#7a6045';

        el.addEventListener('mouseover', function(e) {
            e.stopPropagation();
            el.style.color = 'var(--zhu)';
            el.style.textShadow = '0 0 0.3em rgba(159,59,47,0.58)';
        });

        el.addEventListener('mouseout', function(e) {
            e.stopPropagation();
            el.style.color = '#7a6045';
            el.style.textShadow = 'none';
        });

        el.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var section = el.closest('.snap-section--poem');
            var sourcePoem = section ? section.getAttribute('data-center-title') : '';
            openAuthorCard(name, sourcePoem, section);
        });
    });

    var poemEls = document.querySelectorAll('.poem-info');
    poemEls.forEach(function(el) {
        var name = el.dataset.poem;
        if (!poemData[name]) return;

        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s ease';
        el.style.color = '#7a6045';

        el.addEventListener('mouseover', function(e) {
            e.stopPropagation();
            el.style.color = 'var(--zhu)';
            el.style.textShadow = '0 0 0.3em rgba(159,59,47,0.58)';
        });

        el.addEventListener('mouseout', function(e) {
            e.stopPropagation();
            el.style.color = '#7a6045';
            el.style.textShadow = 'none';
        });

        el.addEventListener('click', function(e) {
            e.stopPropagation();
            buildPoemCard(name);
        });
    });

    var heroTitles = document.querySelectorAll('.hero-title.poem-line');
    heroTitles.forEach(function(el) {
        if (el.dataset.line !== '1') return;

        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s ease';

        el.addEventListener('mouseover', function(e) {
            e.stopPropagation();
            el.style.color = 'var(--zhu)';
            el.style.textShadow = '0 0 0.3em rgba(159,59,47,0.58)';
        });

        el.addEventListener('mouseout', function(e) {
            e.stopPropagation();
            el.style.color = '';
            el.style.textShadow = 'none';
        });

        el.addEventListener('click', function(e) {
            e.stopPropagation();
            var detail = el.nextElementSibling;
            if (detail && detail.classList.contains('poem-line-detail')) {
                if (detail.style.display === 'none' || !detail.classList.contains('is-visible')) {
                    displayCard(detail);
                } else {
                    dismissCard(detail);
                }
            }
            var poemName = el.textContent.trim();
            if (poemData[poemName]) {
                // 直接调用buildPoemCard，传入触发元素
                buildPoemCard(poemName, el);
            }
        });
    });

    // 中央标题点击已由 harmony-transition.js 接管，这里不再给整块 section 绑定 click，
    // 否则点击诗句时事件冒泡到 section，会误触发整首诗信息卡，覆盖句解析卡内容。

    prepareImageText();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthorInfo);
} else {
    initAuthorInfo();
}

// 供其他交互模块调用：统一收起由 author-info 管理的卡片
window.dismissActiveInfoCard = function() {
    if (activeCard) {
        dismissCard(activeCard);
    }
};
