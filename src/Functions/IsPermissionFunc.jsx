export const isPermission = (arr, permissionIdsList) => {
    if (!permissionIdsList) return;
    let countOfPer = 0
    permissionIdsList?.forEach((id) => {
        if (arr.includes(id)) {
            countOfPer++;
        }
    })

    if (countOfPer == permissionIdsList.length) {
        return true
    }
    else {
        return false
    }
}