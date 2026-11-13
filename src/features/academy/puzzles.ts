export type Puzzle=Readonly<{
  id:string;chapter:string;title:string;narrative:string;
  choices:readonly string[];correctIndex:number;explanation:string;
}>;
export const PUZZLES:readonly Puzzle[]=[
  {
    id:"p1",chapter:"الفصل 1 — أساسيات المال",title:"اختيار قبل الإنفاق",
    narrative:"لديك 10,000 دج افتراضية، وفاتورة ضرورية بقيمة 4,000 دج. ما أفضل بداية؟",
    choices:["شراء شيء غير ضروري أولًا","تخصيص قيمة الفاتورة قبل الإنفاق","اقتراض مبلغ إضافي"],
    correctIndex:1,
    explanation:"تمييز المصاريف الضرورية وحجز قيمتها يساعدك على تجنب العجز."
  },{
    id:"p2",chapter:"الفصل 2 — الميزانية",title:"خطة واقعية",
    narrative:"بعد سداد الفاتورة بقي 6,000 دج افتراضية. كيف تخطط للشهر؟",
    choices:["تقسيم المال بين الاحتياجات والادخار والمرونة","تخصيص جميع الأموال للكماليات","تجاهل أي مصروف طارئ"],
    correctIndex:0,
    explanation:"الميزانية المرنة توازن بين الاحتياجات والادخار والمفاجآت."
  },{
    id:"p3",chapter:"الفصل 3 — الأهداف",title:"هدف يستمر",
    narrative:"ادخرت 2,000 من أصل 8,000 دج افتراضية لهدف. ما نسبة تقدمك؟",
    choices:["50%","75%","25%"],
    correctIndex:2,
    explanation:"2,000 ÷ 8,000 = 25%. المهم هو التقدم الواقعي بدون ضغط."
  }
];
export function evaluatePuzzle(puzzle:Puzzle,choice:number):{correct:boolean;feedback:string}{
  if(!Number.isInteger(choice)||choice<0||choice>=puzzle.choices.length)
    throw new RangeError("Choose a valid answer");
  const correct=choice===puzzle.correctIndex;
  return {correct,feedback:correct?puzzle.explanation:"جرّب مجددًا: "+puzzle.explanation};
}
