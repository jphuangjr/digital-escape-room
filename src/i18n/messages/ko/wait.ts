import type en from "../en/wait";

const messages: Record<keyof typeof en, string> = {
  "wait.tips.label": "기다리는 동안",
  "wait.tips.gathering": "일행을 기다리고 있나요? 아래 코드나 QR 코드를 공유하세요.",

  "wait.ada.boot1": "자가 진단… 정상",
  "wait.ada.boot2": "/home/ada 마운트 중… 정상",
  "wait.ada.boot3": "마지막 세션 복원 중…",
  "wait.ada.tip1": "모두가 같은 노트북을 봐요. 한 명은 이메일을 읽고, 다른 한 명은 파일을 살펴보는 식으로 나눠 보세요.",
  "wait.ada.tip2": "누구 한 명이 잠금을 풀면 방 전체에 한꺼번에 열려요.",
  "wait.ada.tip3": "천천히 읽으세요. 이름, 날짜, 묘한 표현이 나중에 중요해지곤 해요.",
  "wait.ada.tip4": "메모는 공유하기 전까지 나만 볼 수 있어요. 좋은 발견은 방에 보내 주세요.",
  "wait.ada.tip5": "막혔나요? 방 메뉴에서 에이다에게 힌트를 요청하세요. 모두에게 음성 메시지로 도착해요.",

  "wait.train.departures": "출발",
  "wait.train.platform": "{n}번 승강장",
  "wait.train.status": "탑승 중",
  "wait.train.tip1": "벽을 하나씩 맡아서 보이는 걸 말해 주세요. 방마다 벽이 네 개 있어요.",
  "wait.train.tip2": "누가 무엇을 집든 일행 모두와 공유돼요.",
  "wait.train.tip3": "소지품끼리 맞대 보세요. 평범한 물건 두 개가 쓸모 있는 무언가가 되기도 해요.",
  "wait.train.tip4": "연속 세 번 틀리면 자물쇠가 1분 동안 잠겨요. 먼저 시도 기록을 확인하세요.",
  "wait.train.tip5": "막혔나요? 테오도르를 부르세요. 야간 포터의 쪽지는 한 장씩 더 분명해져요.",

  "wait.atlas.tip1": "꼭 함께 다닐 필요는 없어요. 흩어져서 살펴보고 채팅으로 알려 주세요.",
  "wait.atlas.tip2": "읽은 내용은 모두 노트에 옮겨 적혀서, 되돌아가지 않아도 단서를 다시 볼 수 있어요.",
  "wait.atlas.tip3": "누가 무엇을 찾든 일행 모두와 공유돼요.",
  "wait.atlas.tip4": "연속 세 번 틀리면 자물쇠가 1분 동안 잠겨요. 먼저 시도 기록을 확인하세요.",
  "wait.atlas.tip5": "막혔나요? 지도 제작자의 메모가 지금 서 있는 곳의 퍼즐을 도와줘요.",
};

export default messages;
